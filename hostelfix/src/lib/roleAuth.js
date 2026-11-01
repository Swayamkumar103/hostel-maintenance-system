import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/module/User";

/**
 * Extract token from request headers or cookies.
 */
export async function extractToken(request) {
    if (request) {
        const authHeader = request.headers?.get?.("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.split(" ")[1];
        }

        const cookieToken = request.cookies?.get?.("token")?.value;
        if (cookieToken) {
            return cookieToken;
        }
    }

    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieVal = cookieStore.get("token")?.value;
        if (cookieVal) return cookieVal;
    } catch (err) {
        if (err?.digest?.startsWith("NEXT_")) throw err;
        // Not in server component context or outside Next.js runtime
    }

    return null;
}

/**
 * Verify JWT token and load authenticated user.
 */
export async function getAuthUser(request) {
    try {
        const token = await extractToken(request);
        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET || "hostelfix_dev_secret_key_123";
        const decoded = jwt.verify(token, secret);
        const userId = decoded.userId || decoded.id || decoded._id;

        await connectDB();
        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return null;
        }

        return {
            ...user,
            _id: user._id.toString(),
            id: user._id.toString(),
        };
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_")) {
            throw error;
        }
        console.error("Auth verification failed:", error.message);
        return null;
    }
}

/**
 * Assert user has one of the allowed roles.
 */
export async function requireRoles(allowedRoles = [], request = null) {
    const user = await getAuthUser(request);
    if (!user) {
        return {
            authorized: false,
            status: 401,
            message: "Authentication required. Please sign in.",
            user: null,
        };
    }

    if (!allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            status: 403,
            message: `Access denied. Requires one of [${allowedRoles.join(", ")}] roles.`,
            user,
        };
    }

    return {
        authorized: true,
        status: 200,
        user,
    };
}

/**
 * Return MongoDB filter criteria scoping complaints to user's assigned hostel(s).
 * Admins have no restriction (returns {}).
 * Wardens are restricted to user.assignedHostels or user.hostel.
 */
export function getHostelFilterForUser(user) {
    if (!user) return { _id: null }; // block all
    if (user.role === "admin") {
        return {}; // No filter, unrestricted
    }

    if (user.role === "warden") {
        const hostels = Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0
            ? user.assignedHostels
            : user.hostel
                ? [user.hostel]
                : [];

        if (hostels.length === 0) {
            // Warden not assigned to any hostel yet
            return { _id: null };
        }

        return { hostel: { $in: hostels } };
    }

    return { _id: null };
}

/**
 * IDOR Check: Ensure user is authorized to view/modify a specific complaint.
 */
export function canUserAccessComplaint(user, complaint) {
    if (!user || !complaint) return false;
    if (user.role === "admin") return true;

    if (user.role === "warden") {
        const hostels = Array.isArray(user.assignedHostels) && user.assignedHostels.length > 0
            ? user.assignedHostels
            : user.hostel
                ? [user.hostel]
                : [];
        return hostels.includes(complaint.hostel);
    }

    if (user.role === "technician") {
        const techId = user._id?.toString() || user.id?.toString();
        const assignedId = (complaint.assignedTechnician || complaint.assignedTechician)?.toString();
        return techId && assignedId && techId === assignedId;
    }

    if (user.role === "student") {
        const studentId = user._id?.toString() || user.id?.toString();
        const compStudentId = (complaint.studentId?._id || complaint.studentId)?.toString();
        return studentId && compStudentId && studentId === compStudentId;
    }

    return false;
}
