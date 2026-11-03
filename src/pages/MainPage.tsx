import { useEffect, useRef, useState } from "react";
import EventsPage from "./EventsPage";
import ScratchToReveal from "./ScratchToReveal";

function MainPage() {
    const scrollContainerRef = useRef<HTMLElement>(null);
    const [showScrollCue, setShowScrollCue] = useState(true);
    const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const updateScrollCue = () => {
            setShowScrollCue(scrollContainer.scrollTop < 24);
        };

        scrollContainer.addEventListener("scroll", updateScrollCue, { passive: true });
        updateScrollCue();

        return () => scrollContainer.removeEventListener("scroll", updateScrollCue);
    }, []);

    return (
        <main ref={scrollContainerRef} className="invitation-page relative h-[100svh] w-full overflow-x-hidden overflow-y-auto">
            <section
                className="invitation-hero relative isolate flex h-[100svh] min-h-[100svh] w-full flex-col items-center gap-2 overflow-hidden text-center text-maroon"
                style={{ backgroundImage: `url("${publicAsset("first-page.png")}")` }}
            >
                <div aria-hidden="true" className="invitation-wash absolute inset-0" />
                <div aria-hidden="true" className="invitation-frame absolute inset-[10px] sm:inset-[18px]" />

                <div className="invitation-hero-content relative z-10 flex h-full min-h-0 w-full max-w-[760px] flex-col items-center">
                    <header className="invitation-intro flex shrink-0 flex-col items-center">
                        <img
                            className="invitation-auspicious-mark h-9 w-9 object-contain sm:h-11 sm:w-11"
                            src={publicAsset("swastik.png")}
                            alt=""
                        />
                        <p className="mt-2 font-['Cormorant_Garamond',serif] text-[10px] font-medium uppercase tracking-[0.24em] text-terracotta sm:text-xs">
                            Together with our families
                        </p>
                        <h1 className="invitation-title mt-1 font-['Great_Vibes',cursive] text-[clamp(2.4rem,8vw,4.3rem)] leading-[1.05] text-[#633b34]">
                            We&apos;re getting married
                        </h1>
                        <div className="invitation-divider mt-3 flex w-40 items-center gap-3 sm:mt-4 sm:w-52">
                            <span className="h-px flex-1 bg-terracotta/40" />
                            <span aria-hidden="true" className="text-sm text-terracotta">♥</span>
                            <span className="h-px flex-1 bg-terracotta/40" />
                        </div>
                    </header>

                    <section aria-label="The happy couple" className="invitation-names mt-12 flex shrink-0 flex-col items-center sm:mt-16">
                        <div className="invitation-name-block">
                            <h2 className="font-['Great_Vibes',cursive] text-[clamp(3rem,11vw,5rem)] leading-[0.95] text-[#633b34]">
                                Kartik
                            </h2>
                            <p className="invitation-family mt-1 max-w-[min(90vw,32rem)] font-['Cormorant_Garamond',serif] text-[clamp(0.82rem,3.3vw,1.08rem)] italic leading-snug text-terracotta">
                                Son of Mrs. Nanda Rawat &amp; Mr. Bisan Singh Rawat
                            </p>
                        </div>

                        <p aria-hidden="true" className="my-2 font-['Great_Vibes',cursive] text-3xl leading-none text-[#85665e] sm:my-3 sm:text-4xl">
                            &amp;
                        </p>

                        <div className="invitation-name-block">
                            <h2 className="font-['Great_Vibes',cursive] text-[clamp(3rem,11vw,5rem)] leading-[0.95] text-[#633b34]">
                                Priyanka
                            </h2>
                            <p className="invitation-family mt-1 max-w-[min(90vw,32rem)] font-['Cormorant_Garamond',serif] text-[clamp(0.82rem,3.3vw,1.08rem)] italic leading-snug text-terracotta">
                                Daughter of Mrs. Rajni Mehta &amp; Mr. Bishan Singh Mehta
                            </p>
                        </div>
                    </section>

                    <div className="invitation-couple relative mt-auto flex min-h-[clamp(140px,22svh,240px)] w-full flex-1 items-end justify-center pt-2">
                        <img
                            className="invitation-portrait h-auto max-h-[min(36svh,320px)] w-auto max-w-[min(82vw,400px)] object-contain object-bottom"
                            src={publicAsset("groom-bride.png")}
                            alt="Illustration of Kartik and Priyanka in their wedding attire"
                        />
                    </div>
                </div>
            </section>
            <a
                className={`invitation-scroll-cue ${showScrollCue ? "is-visible" : "is-hidden"}`}
                href="#wedding-date"
                aria-label="Scroll to discover the wedding date"
                onClick={(event) => {
                    event.preventDefault();
                    document.getElementById("wedding-date")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }}
            >
                <span>Scroll</span>
                <svg aria-hidden="true" viewBox="0 0 32 20" fill="none">
                    <path d="m4 4 12 12L28 4" />
                </svg>
            </a>
            <ScratchToReveal />
            <EventsPage />
        </main>
    );
}

export default MainPage;
