import { useRef, useState } from 'react'

function TapToOpenPage() {
  const ribbonRef = useRef<HTMLVideoElement>(null)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  const handleOpen = () => {
    const ribbon = ribbonRef.current
    if (!ribbon) return

    setPlaybackError(null)
    void ribbon.play().catch(() => {
      setPlaybackError('The ribbon animation could not be played. Tap to try again.')
    })
  }

  return (
    <main className="relative isolate grid min-h-full min-h-dvh place-items-center overflow-hidden bg-parchment bg-[url('/initial-bg-image.png')] bg-cover bg-center bg-no-repeat px-6 py-[clamp(32px,6vh,64px)] before:absolute before:-z-10 before:inset-[clamp(12px,2.4vw,28px)] before:border before:border-maroon/[62%] before:content-[''] after:absolute after:-z-10 after:inset-[clamp(17px,3vw,36px)] after:border after:border-maroon/[24%] after:content-['']">
      <section className="pointer-events-none absolute inset-0 text-center" aria-label="Wedding invitation">
        <p className="absolute top-[6%] left-1/2 w-max max-w-[calc(100%_-_40px)] -translate-x-1/2 text-terracotta text-[clamp(0.7rem,2.5vw,0.9rem)] tracking-[0.22em] uppercase">
          Together with their families
        </p>
        <h1 className="absolute top-[12%] left-1/2 flex w-[min(100%_-_40px,560px)] -translate-x-1/2 flex-col font-['Cormorant_Garamond',Georgia,serif] text-maroon text-[clamp(3.6rem,11vw,6.4rem)] leading-[0.81] font-semibold tracking-[-0.045em] max-[800px]:text-[clamp(3rem,9vh,4.8rem)]">
          <span>Our</span>
          <span>Wedding</span>
          <span>Invitation</span>
        </h1>
        <span className="absolute top-[43%] left-1/2 -translate-x-1/2 text-terracotta text-[2rem] leading-none" aria-hidden="true">✦</span>

        <div className="absolute top-[70%] left-0 z-[101] flex w-full justify-center">
          <video
            ref={ribbonRef}
            className="pointer-events-none fixed top-[calc(60dvh_-_39.4vw)] left-1/2 z-[100] block h-auto w-screen max-w-none -translate-x-1/2"
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onLoadedMetadata={(event) => {
              const ribbon = event.currentTarget
              if (ribbon.duration > 0) ribbon.currentTime = Math.min(0.5, ribbon.duration / 2)
            }}
            onError={() => setPlaybackError('The ribbon animation could not be loaded.')}
          >
            <source src={`${import.meta.env.BASE_URL}RedRibbion.webm`} type="video/webm" />
          </video>
          <button
            className="relative z-[1] pointer-events-auto w-[min(86%,360px)] min-h-28 border-2 border-gold/[64%] bg-[rgb(255_246_229_/_98%)] shadow-[0_12px_22px_rgb(75_33_17_/_19%),inset_0_0_0_5px_rgb(255_255_255_/_54%)] text-maroon cursor-pointer font-['Cormorant_Garamond',Georgia,serif] text-[clamp(2rem,7vw,3.25rem)] leading-none font-semibold transition-[background-color,box-shadow,transform] duration-200 before:absolute before:inset-[9px] before:border before:border-maroon/[72%] before:content-[''] before:pointer-events-none hover:-translate-y-0.5 hover:bg-[#fff8eb] hover:shadow-[0_15px_26px_rgb(75_33_17_/_24%),inset_0_0_0_5px_rgb(255_255_255_/_65%)] focus-visible:outline-3 focus-visible:outline-offset-[5px] focus-visible:outline-terracotta motion-reduce:transition-none"
            type="button"
            onClick={handleOpen}
          >
            <span className="relative z-[2]">Tap to Open</span>
          </button>
          {playbackError && (
            <p className="absolute top-[calc(100%_+_12px)] w-full text-[0.9rem] text-[#842d20]" role="alert">
              {playbackError}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default TapToOpenPage
