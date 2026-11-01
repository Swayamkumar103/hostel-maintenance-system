import { spawn } from "child_process";
import mongoose from "mongoose";
import path from "path";
import { runAllTests } from "../src/tests/warden-admin.test.js";

const MONGO_PORT = 27018;
const MONGO_PATH = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const DB_PATH = path.resolve(process.cwd(), "test-data", "db");

async function main() {
    console.log(`Starting local test mongod on port ${MONGO_PORT} with dbpath ${DB_PATH}...`);
    
    let isReady = false;
    const mongoProcess = spawn(
        MONGO_PATH,
        ["--dbpath", DB_PATH, "--port", String(MONGO_PORT), "--bind_ip_all"],
        { stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
    );

    const readyPromise = new Promise((resolve, reject) => {
        mongoProcess.stdout.on("data", (d) => {
            const str = d.toString();
            if (str.includes("mongod startup complete") || str.includes("Waiting for connections")) {
                isReady = true;
                resolve();
            }
        });
        mongoProcess.stderr.on("data", (d) => {
            console.error("[mongod error]", d.toString().trim());
        });
        mongoProcess.on("exit", (code) => {
            if (!isReady) {
                reject(new Error(`mongod exited prematurely with code ${code}`));
            }
        });
        setTimeout(() => {
            if (!isReady) reject(new Error("Timeout waiting for mongod to report startup complete."));
        }, 15000);
    });

    await readyPromise;
    console.log("mongod is fully initialized and listening!");

    process.env.MONGODB_URI = `mongodb://127.0.0.1:${MONGO_PORT}/hostelfix_test?directConnection=true`;
    process.env.JWT_SECRET = "hostelfix_dev_secret_key_123";

    let testResults;
    try {
        testResults = await runAllTests();
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        console.log("Stopping test mongod process...");
        mongoProcess.kill();
    }

    if (!testResults?.passed) {
        console.error("Some tests failed!");
        process.exit(1);
    } else {
        console.log("\nAll tests passed successfully!");
        process.exit(0);
    }
}

main().catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
});
