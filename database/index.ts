/**
 * Database Models Index
 *
 * Central export point for all Mongoose models.
 * Import from this file to access any model:
 *
 * @example
 * import { Event, Booking } from "@/database";
 * // or
 * import Event from "@/database";
 */

export { default as Event, type IEvent } from "./event.model";
export { default as Booking, type IBooking } from "./booking.model";

// Default export for convenience
export { default } from "./event.model";
