'use client';

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handsleSubmit = async (e: React.FormEvent) => {
        const { success } = await createBooking({ eventId: '', slug: '', email });

        if (success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email });
        } else {
            console.error('Booking failed');
            posthog.captureException('booking creation_failed')
        }
        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    }
    return (


        <div id="book-event">
            {submitted ? (
                <p className="success-message">Thank you for booking!</p>
            ) : (
                <form onSubmit={handsleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>
    )
}

export default BookEvent
