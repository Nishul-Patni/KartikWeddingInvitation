import { useEffect, useRef, useState, type PointerEvent } from "react";

function ScratchToReveal() {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isScratchingRef = useRef(false);
    const lastScratchPointRef = useRef<{ x: number; y: number } | null>(null);
    const scratchStepRef = useRef(0);
    const initialCoatingOpacityRef = useRef(0);
    const [isInView, setIsInView] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d", { willReadFrequently: true });
        if (!canvas || !context || isRevealed) return;

        const drawCoating = () => {
            const bounds = canvas.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;

            const scale = window.devicePixelRatio || 1;
            canvas.width = Math.round(bounds.width * scale);
            canvas.height = Math.round(bounds.height * scale);
            context.setTransform(scale, 0, 0, scale, 0, 0);

            const width = bounds.width;
            const height = bounds.height;
            const edgeRadius = Math.min(width, height) * 0.12;

            context.globalCompositeOperation = "source-over";
            context.clearRect(0, 0, width, height);
            context.beginPath();
            context.roundRect(0, 0, width, height, edgeRadius);
            context.clip();

            const gold = context.createLinearGradient(0, 0, width, height);
            gold.addColorStop(0, "#f7d477");
            gold.addColorStop(0.42, "#e5b34e");
            gold.addColorStop(0.72, "#f8d77f");
            gold.addColorStop(1, "#d9a742");
            context.fillStyle = gold;
            context.fillRect(0, 0, width, height);

            for (let index = 0; index < 150; index += 1) {
                const y = Math.random() * height;
                context.beginPath();
                context.moveTo(Math.random() * width, y);
                context.lineTo(Math.random() * width, y + (Math.random() - 0.5) * 12);
                context.strokeStyle = index % 2 === 0
                    ? "rgb(255 247 204 / 24%)"
                    : "rgb(139 84 19 / 12%)";
                context.lineWidth = Math.random() * 2.5 + 0.5;
                context.stroke();
            }

            for (let index = 0; index < 85; index += 1) {
                context.beginPath();
                context.arc(
                    Math.random() * width,
                    Math.random() * height,
                    Math.random() * 1.5 + 0.3,
                    0,
                    Math.PI * 2,
                );
                context.fillStyle = "rgb(255 248 220 / 36%)";
                context.fill();
            }

            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            let coatingOpacity = 0;
            const stride = 8;
            for (let y = 0; y < canvas.height; y += stride) {
                for (let x = 0; x < canvas.width; x += stride) {
                    coatingOpacity += data[(y * canvas.width + x) * 4 + 3];
                }
            }
            initialCoatingOpacityRef.current = coatingOpacity;
        };

        const resizeObserver = new ResizeObserver(drawCoating);
        resizeObserver.observe(canvas);
        drawCoating();

        return () => resizeObserver.disconnect();
    }, [isRevealed]);

    const revealDate = () => {
        setIsRevealed(true);
    };

    const checkRevealProgress = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d", { willReadFrequently: true });
        if (!canvas || !context || isRevealed) return;

        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let remainingOpacity = 0;
        const initialOpacity = initialCoatingOpacityRef.current;
        const stride = 8;

        for (let y = 0; y < canvas.height; y += stride) {
            for (let x = 0; x < canvas.width; x += stride) {
                remainingOpacity += data[(y * canvas.width + x) * 4 + 3];
            }
        }

        if (initialOpacity > 0 && 1 - remainingOpacity / initialOpacity >= 0.6) {
            revealDate();
        }
    };

    const scratchAt = (event: PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d", { willReadFrequently: true });
        if (!canvas || !context) return;

        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        const lastPoint = lastScratchPointRef.current;
        if (lastPoint) {
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(x, y);
            context.lineWidth = 72;
            context.lineCap = "round";
            context.stroke();
        } else {
            context.arc(x, y, 36, 0, Math.PI * 2);
            context.fill();
        }
        lastScratchPointRef.current = { x, y };
    };

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
        if (isRevealed) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        isScratchingRef.current = true;
        scratchStepRef.current = 0;
        lastScratchPointRef.current = null;
        setHasStarted(true);
        scratchAt(event);
        checkRevealProgress();
    };

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        if (!isScratchingRef.current || isRevealed) return;
        scratchAt(event);
        scratchStepRef.current += 1;
        if (scratchStepRef.current >= 4) {
            scratchStepRef.current = 0;
            checkRevealProgress();
        }
    };

    const handlePointerUp = () => {
        isScratchingRef.current = false;
        lastScratchPointRef.current = null;
        checkRevealProgress();
    };

    return (
        <section
            id="wedding-date"
            ref={sectionRef}
            className={`scratch-reveal relative isolate flex min-h-[100svh] w-full flex-col items-center overflow-hidden px-5 pb-12 pt-[clamp(36px,8vh,84px)] text-center text-maroon sm:px-8 ${isInView ? "is-in-view" : ""}`}
            style={{ backgroundImage: `url("${publicAsset("scratch-to-reveal-bg-image.webp")}")` }}
            aria-labelledby="scratch-reveal-title"
        >
            <div aria-hidden="true" className="scratch-reveal-wash absolute inset-0" />

            <header className="scratch-reveal-heading relative z-10 flex flex-col items-center">
                <img
                    className="scratch-reveal-mountain h-auto w-[clamp(100px,17vw,190px)] object-contain"
                    src={publicAsset("mountain.webp")}
                    alt=""
                />
                <span aria-hidden="true" className="mt-2 h-px w-[clamp(150px,34vw,300px)] bg-maroon/50" />
                <h2
                    id="scratch-reveal-title"
                    className="mt-4 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(2rem,6.6vw,3.8rem)] font-semibold italic leading-[1.05] text-[#742d20] [text-shadow:0_1px_12px_rgb(255_241_221_/_65%)]"
                >
                    A Special Reveal Awaits
                </h2>
                <p className="mt-3 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(1.05rem,3vw,1.55rem)] italic leading-snug text-[#742d20]">
                    There&apos;s something special for you...
                    <br />
                    Scratch below to uncover it!
                </p>
                <span aria-hidden="true" className="mt-3 font-['Cormorant_Garamond',serif] text-2xl leading-none text-[#8f321f]">
                    ~ ❧ ~
                </span>
            </header>

            <div className="scratch-reveal-card relative z-10 mt-5 w-[min(88vw,560px)] aspect-[1609/977] sm:mt-6">
                <img
                    className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
                    src={publicAsset("scratch-here-frame.webp")}
                    alt=""
                    draggable="false"
                />
                <div className="absolute inset-x-[8%] top-[23%] z-20 flex h-[54%] w-[84%] flex-col items-center justify-center">
                    <p className="font-['Cormorant_Garamond',Georgia,serif] text-[clamp(1.1rem,3.8vw,2.2rem)] font-semibold italic leading-tight text-[#742d20]">
                        The Wedding Day
                    </p>
                    <p className="mt-1 whitespace-nowrap font-['Great_Vibes',cursive] text-[clamp(2rem,7.2vw,4.2rem)] leading-[1.05] text-[#742d20]">
                        24 November 2026
                    </p>
                </div>
                <canvas
                    ref={canvasRef}
                    className={`scratch-reveal-coating absolute inset-x-[8%] top-[23%] z-30 h-[54%] w-[84%] ${isRevealed ? "is-revealed" : ""}`}
                    aria-hidden="true"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                />
                {!isRevealed && (
                    <div className={`scratch-reveal-prompt pointer-events-none absolute inset-x-[8%] top-[23%] z-40 flex h-[54%] w-[84%] flex-col items-center justify-center ${hasStarted ? "is-scratching" : ""}`}>
                        <img
                            className="scratch-reveal-icon h-[clamp(38px,8vw,72px)] w-[clamp(38px,8vw,72px)] object-contain"
                            src={publicAsset("scratch-icon.webp")}
                            alt=""
                        />
                        <span className="mt-1 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(1.25rem,4vw,2rem)] font-semibold italic leading-tight text-[#742d20]">
                            Scratch to Reveal
                        </span>
                    </div>
                )}
            </div>

            <button
                className="scratch-reveal-accessible-button relative z-10 mt-2 inline-flex items-center gap-3 rounded-full border border-[#fff1dc]/35 bg-[#8f321f] px-8 py-4 font-['Cormorant_Garamond',Georgia,serif] text-lg font-semibold uppercase tracking-[0.16em] text-[#fff5e7] shadow-[0_8px_20px_rgb(91_48_35_/_22%)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#742d20] hover:shadow-[0_11px_24px_rgb(91_48_35_/_27%)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-maroon motion-reduce:transition-none"
                type="button"
                onClick={() => {
                    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
                    const calendarEvent = [
                        "BEGIN:VCALENDAR",
                        "VERSION:2.0",
                        "PRODID:-//Kartik and Priyanka//Wedding Invitation//EN",
                        "CALSCALE:GREGORIAN",
                        "BEGIN:VEVENT",
                        "UID:kartik-priyanka-wedding-20261124@invitation",
                        `DTSTAMP:${timestamp}`,
                        "DTSTART;VALUE=DATE:20261124",
                        "DTEND;VALUE=DATE:20261125",
                        "SUMMARY:Kartik and Priyanka's Wedding",
                        "DESCRIPTION:Save the date for Kartik and Priyanka's wedding.",
                        "END:VEVENT",
                        "END:VCALENDAR",
                    ].join("\r\n");
                    const calendarUrl = URL.createObjectURL(
                        new Blob([calendarEvent], { type: "text/calendar;charset=utf-8" }),
                    );
                    const link = document.createElement("a");
                    link.href = calendarUrl;
                    link.download = "kartik-and-priyanka-wedding.ics";
                    link.click();
                    window.setTimeout(() => URL.revokeObjectURL(calendarUrl), 1000);
                }}
            >
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3.5" y="5" width="17" height="16" rx="2" />
                    <path strokeLinecap="round" d="M7.5 3v4M16.5 3v4M3.5 10h17M16 14v5M13.5 16.5h5" />
                </svg>
                <span>Save the Date</span>
            </button>
            <button
                className="scratch-reveal-fallback-button relative z-10 mt-3 rounded-full px-4 py-2 font-['Cormorant_Garamond',Georgia,serif] text-base italic text-[#742d20] underline decoration-[#8f321f]/40 underline-offset-4 transition-colors hover:text-[#5f241a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon"
                type="button"
                onClick={revealDate}
            >
                {isRevealed ? "The wedding is on 24 November 2026" : "Tap here if you can’t scratch"}
            </button>
        </section>
    );
}

export default ScratchToReveal;
