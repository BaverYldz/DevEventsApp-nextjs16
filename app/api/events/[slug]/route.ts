import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import type { IEvent } from "@/database/event.model";

/**
 * Dynamic route params interface for slug-based event lookup
 */
interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * API Response types for consistent error/success handling
 */
interface SuccessResponse {
    message: string;
    event: IEvent;
}

interface ErrorResponse {
    message: string;
    error?: string;
}

/**
 * GET /api/events/[slug]
 *
 * Retrieves a single event by its unique slug identifier.
 * Returns 400 for invalid slug, 404 if not found, 500 for server errors.
 */
export async function GET(
    _req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
    try {
        // Await params (Next.js 15+ async params)
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== "string") {
            return NextResponse.json(
                { message: "Invalid request", error: "Slug parameter is required" },
                { status: 400 }
            );
        }

        // Sanitize slug: trim whitespace and validate format
        const sanitizedSlug = slug.trim().toLowerCase();

        if (sanitizedSlug.length === 0) {
            return NextResponse.json(
                { message: "Invalid request", error: "Slug cannot be empty" },
                { status: 400 }
            );
        }

        // Establish database connection
        await dbConnect();

        // Query event by slug (indexed field for performance)
        const event = await Event.findOne({ slug: sanitizedSlug }).lean<IEvent>();

        // Handle event not found
        if (!event) {
            return NextResponse.json(
                { message: "Event not found", error: `No event exists with slug: ${sanitizedSlug}` },
                { status: 404 }
            );
        }

        // Return successful response
        return NextResponse.json(
            { message: "Event fetched successfully", event },
            { status: 200 }
        );
    } catch (error) {
        // Log error for debugging (server-side only)
        console.error("[GET /api/events/[slug]] Error:", error);

        // Return generic error message to client (avoid leaking internals)
        return NextResponse.json(
            {
                message: "Failed to fetch event",
                error: error instanceof Error ? error.message : "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
