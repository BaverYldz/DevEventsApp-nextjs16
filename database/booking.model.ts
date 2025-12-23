import mongoose, { Schema, Document, Model, Types } from "mongoose";
import Event from "./event.model";

/**
 * Booking Model
 *
 * Represents event registrations/bookings.
 * Each booking links a user (via email) to a specific event.
 * Includes pre-save validation to ensure referenced event exists.
 */

// TypeScript interface for Booking document
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Email validation regex pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema definition with validation rules
const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event ID is required"],
            index: true, // Index for faster queries on event lookups
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true, // Normalize email to lowercase for consistency
            validate: {
                validator: (email: string) => EMAIL_REGEX.test(email),
                message: "Please provide a valid email address",
            },
        },
    },
    {
        // Automatically manage createdAt and updatedAt fields
        timestamps: true,
    }
);

// Compound index to prevent duplicate bookings (same email for same event)
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Pre-save hook for Booking model.
 * Validates that the referenced eventId corresponds to an existing Event.
 * Throws an error if the event does not exist to maintain referential integrity.
 */
BookingSchema.pre("save", async function (next) {
    // Only validate eventId if it's new or modified
    if (this.isModified("eventId") || this.isNew) {
        const eventExists = await Event.findById(this.eventId);

        if (!eventExists) {
            const error = new Error(
                `Event with ID ${this.eventId} does not exist. Cannot create booking for non-existent event.`
            );
            return next(error);
        }
    }

    next();
});

// Create and export the Booking model (check if already compiled to prevent OverwriteModelError)
const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
