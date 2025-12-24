import { notFound } from "next/navigation";
import Image from "next/image";

import BookEvent from "@/components/BookEvent";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p >
    </div >
)



const Eventagenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)


const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const { slug } = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const { event: { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } } = await request.json();

    if (!description) return notFound();

    const bookings = 10;
    return (
        <section id="event">
            <div className="header">
                <h1>Event Descripton</h1>
                <p className="mt-2">{description}</p>
            </div>

            <div className="details">
                {/* left side */}
                <div className="content">
                    <Image src={image} alt="event poster" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="calendar" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="calendar" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="calendar" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="calendar" label={audience} />
                    </section>

                    <Eventagenda agendaItems={JSON.parse(agenda[0])} />


                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={JSON.parse(tags[0])} />
                </div>
                {/* rigth side */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot Now!</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} others who have booked their spot.
                            </p>
                        ) : (<p className="text-sm"> Be te first to book your spot.</p>)}

                        <BookEvent />
                    </div>

                </aside>
            </div>
        </section>
    )
}

export default EventDetailsPage