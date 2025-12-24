import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Event Model
 *
 * Represents developer events like conferences, meetups, and hackathons.
 * Includes automatic slug generation and date normalization via pre-save hooks.
 */

// TypeScript interface for Event document
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: "online" | "offline" | "hybrid";
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition with validation rules
const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, "Overview is required"],
            trim: true,
        },
        image: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, "Venue is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        date: {
            type: String,
            required: [true, "Date is required"],
        },
        time: {
            type: String,
            required: [true, "Time is required"],
        },
        mode: {
            type: String,
            required: [true, "Mode is required"],
            enum: {
                values: ["online", "offline", "hybrid"],
                message: "Mode must be online, offline, or hybrid",
            },
        },
        audience: {
            type: String,
            required: [true, "Audience is required"],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, "Agenda is required"],
            validate: {
                validator: (arr: string[]) => arr.length > 0,
                message: "Agenda must have at least one item",
            },
        },
        organizer: {
            type: String,
            required: [true, "Organizer is required"],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, "Tags are required"],
            validate: {
                validator: (arr: string[]) => arr.length > 0,
                message: "At least one tag is required",
            },
        },
    },
    {
        // Automatically manage createdAt and updatedAt fields
        timestamps: true,
    }
);

/**
 * Generates a URL-friendly slug from the given title.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Normalizes date string to ISO format (YYYY-MM-DD).
 * Accepts various date formats and outputs consistent ISO date.
 */
function normalizeDate(dateStr: string): string {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
    }
    // Return ISO date string (YYYY-MM-DD)
    return parsed.toISOString().split("T")[0];
}

/**
 * Normalizes time to 24-hour format (HH:MM).
 * Handles various input formats like "2:30 PM", "14:30", etc.
 */
function normalizeTime(timeStr: string): string {
    const trimmed = timeStr.trim().toUpperCase();

    // Check if already in 24-hour format (HH:MM)
    const time24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (time24Match) {
        const hours = parseInt(time24Match[1], 10);
        const minutes = time24Match[2];
        if (hours >= 0 && hours <= 23) {
            return `${hours.toString().padStart(2, "0")}:${minutes}`;
        }
    }

    // Parse 12-hour format (e.g., "2:30 PM", "10:00 AM")
    const time12Match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (time12Match) {
        let hours = parseInt(time12Match[1], 10);
        const minutes = time12Match[2];
        const period = time12Match[3];

        // Convert to 24-hour format
        if (period === "PM" && hours !== 12) {
            hours += 12;
        } else if (period === "AM" && hours === 12) {
            hours = 0;
        }

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    throw new Error(`Invalid time format: ${timeStr}. Use HH:MM or H:MM AM/PM`);
}

/**
 * Pre-save hook for Event model.
 * - Generates slug from title (only if title is new or modified)
 * - Normalizes date to ISO format
 * - Normalizes time to consistent 24-hour format
 */
EventSchema.pre("save", async function () {
    // Generate slug only if title is new or modified
    if (this.isModified("title") || this.isNew) {
        const baseSlug = generateSlug(this.title);

        // Check for existing slugs and append number if needed to ensure uniqueness
        const Event = this.constructor as Model<IEvent>;
        let slug = baseSlug;
        let counter = 1;

        // Find existing events with similar slugs (excluding current document)
        while (
            await Event.findOne({
                slug,
                _id: { $ne: this._id },
            })
        ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }

    // Normalize date to ISO format (YYYY-MM-DD)
    if (this.isModified("date") || this.isNew) {
        this.date = normalizeDate(this.date);
    }

    // Normalize time to 24-hour format (HH:MM)
    if (this.isModified("time") || this.isNew) {
        this.time = normalizeTime(this.time);
    }
});

// Create and export the Event model (check if already compiled to prevent OverwriteModelError)
const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
