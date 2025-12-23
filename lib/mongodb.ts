import mongoose, { Mongoose } from "mongoose";

/**
 * MongoDB Connection Module
 *
 * This module handles the MongoDB connection using Mongoose with connection caching
 * to prevent multiple connections during Next.js development hot reloads.
 */

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Define the shape of our cached connection object
interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Extend the global namespace to include our mongoose cache
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

/**
 * Global cache for the MongoDB connection.
 * In development, Next.js clears the Node.js module cache on every request,
 * which would create a new connection each time. By caching on `global`,
 * we preserve the connection across hot reloads.
 */
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

// Persist the cache reference on global for subsequent imports
if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 *
 * Features:
 * - Returns cached connection if available (prevents multiple connections)
 * - Creates new connection only when necessary
 * - Buffers commands until connection is established
 *
 * @returns Promise<Mongoose> - The Mongoose connection instance
 * @throws Error if MONGODB_URI environment variable is not defined
 */
async function dbConnect(): Promise<Mongoose> {
    // Validate that the connection string exists
    if (!MONGODB_URI) {
        throw new Error(
            "Please define the MONGODB_URI environment variable inside .env.local"
        );
    }

    // Return existing connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // If no existing promise, create a new connection
    if (!cached.promise) {
        const opts: mongoose.ConnectOptions = {
            // Buffer commands until connection is established
            bufferCommands: true,
        };

        // Create the connection promise
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    // Await the connection and cache the result
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset the promise on error to allow retry on next call
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default dbConnect;
