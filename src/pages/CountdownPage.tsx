import { useEffect, useRef, useState } from "react";
import "./CountdownPage.css";

const weddingDate = new Date("2026-11-24T00:00:00+05:30").getTime();
const timeUnits = [
    { key: "days", label: "Days", divisor: 24 * 60 * 60 * 1000 },
    { key: "hours", label: "Hours", divisor: 60 * 60 * 1000 },
    { key: "minutes", label: "Minutes", divisor: 60 * 1000 },
    { key: "seconds", label: "Seconds", divisor: 1000 },
] as const;

function getTimeRemaining(now: number) {
    let remaining = Math.max(0, weddingDate - now);

    return timeUnits.map(({ key, divisor }) => {
        const value = Math.floor(remaining / divisor);
        remaining %= divisor;
        return { key, value };
    });
}

function CountdownPage() {
    const pageRef = useRef<HTMLElement>(null);
    const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(Date.now()));
    const [isVisible, setIsVisible] = useState(false);
    const publicAsset = (path: string) => `${import.meta.env.BASE_URL}count-down-page/${path}`;

    useEffect(() => {
        const updateCountdown = () => setTimeRemaining(getTimeRemaining(Date.now()));
        const intervalId = window.setInterval(updateCountdown, 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: page.closest(".invitation-page"),
                threshold: 0.2,
            },
        );

        observer.observe(page);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={pageRef}
            id="countdown"
            className={`countdown-page ${isVisible ? "is-visible" : ""}`}
            aria-labelledby="countdown-title"
            style={{ backgroundImage: `url("${publicAsset("count-down-background.webp")}")` }}
        >
            <div className="countdown-shade" aria-hidden="true" />

            <div className="countdown-content">
                <div className="countdown-copy">
                    <p className="countdown-eyebrow">A Kumaoni celebration</p>
                    <h1 id="countdown-title">Kartik <span>&amp;</span> Priyanka</h1>
                    <p className="countdown-tagline">Counting down to our forever</p>

                    <div className="countdown-timer" role="timer" aria-live="off">
                        {timeUnits.map(({ key, label }) => (
                            <div className="countdown-unit" key={key} aria-label={`${label} remaining`}>
                                <span className="countdown-value">
                                    {String(timeRemaining.find((unit) => unit.key === key)?.value ?? 0).padStart(2, "0")}
                                </span>
                                <span className="countdown-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    <p className="countdown-date">
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="5" width="14" height="12" rx="1.5" />
                            <path d="M6.5 3v4M13.5 3v4M3 8.5h14" />
                        </svg>
                        <time dateTime="2026-11-24">24 November 2026</time>
                    </p>

                    <a className="countdown-cta" href="#wedding-events">
                        Explore the Celebrations
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <img
                    className="countdown-couple"
                    src={publicAsset("kartik-priyanka-transparent.webp")}
                    alt="Kartik and Priyanka in traditional Kumaoni wedding attire"
                    fetchPriority="high"
                />
            </div>
        </section>
    );
}

export default CountdownPage;
