import { useEffect, useRef, useState, type ReactNode } from "react";

const pineResortMap = "https://maps.app.goo.gl/y5jwcZEruMLgAX8w5";
const receptionMap = "https://maps.app.goo.gl/DQAV4pGSH7UxT49PA";
import "./EventsPage.css";

function publicAsset(path: string) {
    return `${import.meta.env.BASE_URL}events-page/${path}`;
}

interface EventRevealProps {
    children: ReactNode;
    className?: string;
    frame?: "cream" | "maroon";
    label: string;
}

function EventReveal({ children, className = "", frame = "cream", label }: EventRevealProps) {
    const cardRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

        observer.observe(card);
        return () => observer.disconnect();
    }, []);

    return (
        <article
            ref={cardRef}
            className={`events-entry ${isVisible ? "is-visible" : ""} ${className}`}
            aria-label={label}
        >
            <picture className="events-card-frame" aria-hidden="true">
                <source
                    media="(max-width: 650px)"
                    srcSet={publicAsset(
                        frame === "maroon"
                            ? "Ornate-Maroon-and-Gold-Card-Frame-Potrait.png"
                            : "Ornate-Cream-Frame-Potrait.png",
                    )}
                />
                <img
                    src={publicAsset(
                        frame === "maroon"
                            ? "Ornate-Maroon-and-Gold-Card-Frame.png"
                            : "Ornate-Cream-Frame.png",
                    )}
                    alt=""
                />
            </picture>
            {children}
        </article>
    );
}

function DateLabel({ children }: { children: ReactNode }) {
    return (
        <p className="events-date">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="5" width="14" height="12" rx="1.5" />
                <path d="M6.5 3v4M13.5 3v4M3 8.5h14" />
            </svg>
            {children}
        </p>
    );
}

function Venue({ children }: { children: ReactNode }) {
    return (
        <p className="events-venue">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path d="M16 8.2c0 4.1-6 9-6 9s-6-4.9-6-9a6 6 0 1 1 12 0Z" />
                <circle cx="10" cy="8" r="2" />
            </svg>
            <span>{children}</span>
        </p>
    );
}

function EventsPage() {
    return (
        <section
            id="wedding-events"
            className="events-page"
            aria-labelledby="events-title"
        >
            <img
                className="events-background"
                src={publicAsset("events-page-background.png")}
                alt=""
                aria-hidden="true"
            />
            <img
                className="events-flower events-flower-left"
                src={publicAsset("flower-border-with-bell-left.png")}
                alt=""
                aria-hidden="true"
            />
            <img
                className="events-flower events-flower-right"
                src={publicAsset("flower-border-right.png")}
                alt=""
                aria-hidden="true"
            />

            <header className="events-header">
                <p className="events-eyebrow">With joyful hearts, we invite you to</p>
                <h2 id="events-title">The Wedding Celebrations</h2>
                <p className="events-intro">
                    Four days of traditions, blessings, laughter &amp; togetherness.
                </p>
                <div className="events-divider" aria-hidden="true">
                    <span />
                    <span>♥</span>
                    <span />
                </div>
            </header>

            <div className="events-list">
                <EventReveal label="22 November 2026: Ganesh Pooja and Suwal Patha">
                    <div className="event-art">
                        <img
                            src={publicAsset("ganesh-ji-icon.png")}
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                    <div className="event-copy">
                        <DateLabel>Day 01 · 22 November 2026</DateLabel>
                        <h3>Ganesh Pooja &amp; Suwal Patha</h3>
                        <p className="event-description">
                            Auspicious beginnings and cherished Kumaoni traditions.
                        </p>
                    </div>
                    <div className="event-details">
                        <ul>
                            <li>
                                <span className="event-detail-title">Ganesh Pooja</span>
                                <span>Morning, according to the auspicious muhurat.</span>
                            </li>
                            <li>
                                <span className="event-detail-title">Suwal Patha</span>
                                <span>As part of the day&apos;s traditional ceremonies.</span>
                            </li>
                        </ul>
                        <Venue>Groom&apos;s family residence</Venue>
                    </div>
                </EventReveal>

                <EventReveal label="23 November 2026: Haldi and Mehendi">
                    <div className="event-art">
                        <img
                            src={publicAsset("haldi-mahendi-icon.png")}
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                    <div className="event-copy">
                        <DateLabel>Day 02 · 23 November 2026</DateLabel>
                        <h3>Haldi &amp; Mehendi</h3>
                        <p className="event-description">
                            A day filled with colours, laughter and joyful celebrations.
                        </p>
                    </div>
                    <div className="event-details">
                        <ul>
                            <li className="haldi-detail">
                                <span className="event-detail-title">Haldi</span>
                                <span>Morning</span>
                                <span className="event-note">Exact time to be confirmed</span>
                            </li>
                            <li>
                                <span className="event-detail-title">Mehendi</span>
                                <span>8:00 PM</span>
                            </li>
                        </ul>
                        <Venue>Groom&apos;s family residence</Venue>
                    </div>
                </EventReveal>

                <EventReveal
                    className="wedding-day-card"
                    frame="maroon"
                    label="24 November 2026: The Wedding Day"
                >
                    <div className="wedding-day-art">
                        <img
                            src={publicAsset("wedding-day-icon.png")}
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                    <div className="wedding-day-heading">
                        <DateLabel>Day 03 · 24 November 2026</DateLabel>
                        <h3>The Wedding Day</h3>
                        <p>The most special day, bringing two souls and families together.</p>
                    </div>
                    <ol className="wedding-timeline" aria-label="Wedding day schedule">
                        <li>
                            <span className="timeline-motif" aria-hidden="true">❧</span>
                            <strong>11:00 AM</strong>
                            <span>Baraat departure</span>
                            <small>From the residence</small>
                        </li>
                        <li>
                            <span className="timeline-motif" aria-hidden="true">✿</span>
                            <strong>12:00 PM</strong>
                            <span>Rateli</span>
                        </li>
                        <li>
                            <span className="timeline-motif" aria-hidden="true">ॐ</span>
                            <strong>Panigrahan Sanskar</strong>
                            <span>As per confirmed auspicious muhurat</span>
                        </li>
                        <li>
                            <span className="timeline-motif" aria-hidden="true">❧</span>
                            <strong>5:00 PM</strong>
                            <span>Baraat return</span>
                        </li>
                    </ol>
                    <div className="wedding-day-footer">
                        <Venue>Wedding venue: Groom&apos;s family residence</Venue>
                        <p className="baraat-route">
                            Baraat travels from the residence to{" "}
                            <a href={pineResortMap} target="_blank" rel="noreferrer">
                                Pine Resort
                                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                                    <path d="M9 2h5v5M14 2 7 9" />
                                    <path d="M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" />
                                </svg>
                            </a>
                        </p>
                    </div>
                </EventReveal>

                <EventReveal label="25 November 2026: Wedding Reception">
                    <div className="event-art">
                        <img
                            src={publicAsset("reception-icon.png")}
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                    <div className="event-copy">
                        <DateLabel>Day 04 · 25 November 2026</DateLabel>
                        <h3>Wedding Reception</h3>
                        <p className="event-description">
                            Let&apos;s celebrate the beginning of a beautiful new journey.
                        </p>
                    </div>
                    <div className="event-details reception-details">
                        <ul>
                            <li>
                                <span className="event-detail-title">Time</span>
                                <span>After 10:00 AM</span>
                            </li>
                        </ul>
                        <Venue>Aashirwad Banquet Hall</Venue>
                        <a
                            className="events-map-link"
                            href={receptionMap}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View venue on Google Maps
                            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                                <path d="M9 2h5v5M14 2 7 9" />
                                <path d="M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" />
                            </svg>
                        </a>
                    </div>
                </EventReveal>
            </div>
        </section>
    );
}

export default EventsPage;
