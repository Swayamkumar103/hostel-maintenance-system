import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/module/User";

/**
 * Extract the JWT token from the incoming request.
 *
 * Token can come from two places:
 *   1. Authorization header: "Bearer <token>"
 *   2. Cookie named "token"
 *
 * When called from an API route, `request` is provided.
 * When called from a Server Component (layout/page), there is no `request`,
 * so we use Next.js's `next/headers` cookies() helper instead.
 */
export async function extractToken(request) {
    // --- Case 1: request object was passed (API route) ---
    if (request) {
        // Try Authorization: Bearer <token> header first
        const authHeader = request.headers?.get?.("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.split(" ")[1]; // return the token part
        }

        // Try cookie named "token"
        const cookieToken = request.cookies?.get?.("token")?.value;
        if (cookieToken) {
            return cookieToken;
        }
    }

    // --- Case 2: no request object (called from Server Component) ---
    // We dynamically import next/headers here because it only works inside
    // the Next.js server runtime (not in plain Node.js or test environments).
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieVal = cookieStore.get("token")?.value;
        if (cookieVal) return cookieVal;
    } catch (err) {
        // If Next.js threw a redirect or not-found internally, re-throw it.
        // Otherwise ignore (we are outside server component context).
        if (err?.digest?.startsWith("NEXT_")) throw err;
    }

    return null; // no token found
}

/**
 * Verify the JWT token and return the logged-in user from the database.
 * Returns null if the token is missing, invalid, or the user no longer exists.
 */
export async function getAuthUser(request) {
    try {
        const token = await extractToken(request);
        if (!token) {
            return null; // not logged in
        }

        // Verify the token using the secret key
        const secret = process.env.JWT_SECRET || "hostelfix_dev_secret_key_123";
        const decoded = jwt.verify(token, secret);

        // Support multiple possible field names for user ID in the token payload
        const userId = decoded.userId || decoded.id || decoded._id;

        // Load the user from MongoDB (exclude the password field)
        await connectDB();
        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return null; // user deleted from DB
        }

        // Return the user with _id converted to a plain string
        return {
            ...user,
            _id: user._id.toString(),
            id: user._id.toString(),
        };
    } catch (error) {
        // Re-throw Next.js internal errors (redirect, not-found)
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("Auth verification failed:", error.message);
        return null;
    }
}

/**
 * Check if the logged-in user has one of the required roles.
 * Returns an object with { authorized, status, message, user }.
 *
 * Usage: const { authorized, user } = await requireRoles(["admin", "warden"], request);
 */
export async function requireRoles(allowedRoles = [], request = null) {
    const user = await getAuthUser(request);

    // Not logged in
    if (!user) {
        return {
            authorized: false,
            status: 401,
            message: "Authentication required. Please sign in.",
            user: null,
        };
    }

    // Logged in but wrong role
    if (!allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            status: 403,
            message: `Access denied. Requires one of [${allowedRoles.join(", ")}] roles.`,
            user,
        };
    }

    // All good
    return {
        authorized: true,
        status: 200,
        user,
    };
}

/**
 * Build a MongoDB filter to scope complaints to only the hostels this user can see.
 *
 * - admin:  no restriction → returns {} (empty filter = all complaints)
 * - warden: restricted to their assigned hostels
 * - other:  blocked → returns { _id: null } which matches nothing
 */
export function getHostelFilterForUser(user) {
    if (!user) {
        return { _id: null }; // no user = block all results
    }

    if (user.role === "admin") {
        return {}; // admin sees everything
    }

    if (user.role === "warden") {
        // Get the list of hostels this warden is assigned to.
        // Wardens may have an array (assignedHostels) or a single value (hostel).
        let hostels = [];

        if (Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0) {
            hostels = user.assignedHostels;
        } else if (user.hostel) {
            hostels = [user.hostel];
        }

        if (hostels.length === 0) {
            return { _id: null }; // warden has no hostel yet, block all
        }

        return { hostel: { $in: hostels } }; // only show complaints from their hostels
    }

    return { _id: null }; // any other role (student, technician) cannot use this filter
}

/**
 * IDOR Protection: Check if the logged-in user is allowed to view or modify a specific complaint.
 *
 * IDOR = Insecure Direct Object Reference — prevents users from accessing other users' data.
 *
 * Rules:
 * - admin: can access any complaint
 * - warden: can access complaints in their assigned hostel(s)
 * - technician: can only access complaints assigned to them
 * - student: can only access their own complaints
 */
export function canUserAccessComplaint(user, complaint) {
    if (!user || !complaint) return false;

    if (user.role === "admin") {
        return true; // admin can see all
    }

    if (user.role === "warden") {
        // Get warden's hostel list (same logic as getHostelFilterForUser)
        let hostels = [];
        if (Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0) {
            hostels = user.assignedHostels;
        } else if (user.hostel) {
            hostels = [user.hostel];
        }

        // Allow access only if the complaint's hostel matches the warden's list
        return hostels.includes(complaint.hostel);
    }

    if (user.role === "technician") {
        const myId = user._id?.toString() || user.id?.toString();

        // Note: "assignedTechician" (one 'n') is a legacy typo field kept for backward compatibility.
        // Both fields hold the same value; we check both to support old DB records.
        const assignedId = (complaint.assignedTechnician || complaint.assignedTechician)?.toString();

        return myId && assignedId && myId === assignedId;
    }

    if (user.role === "student") {
        const myId = user._id?.toString() || user.id?.toString();

        // studentId can be a populated object or a plain ID reference
        const complaintStudentId = (complaint.studentId?._id || complaint.studentId)?.toString();

        return myId && complaintStudentId && myId === complaintStudentId;
    }

    return false; // unknown role
}
