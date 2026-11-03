import { useEffect, useState } from "react";
import FallingSakura from "./components/FallingSakura";
import MainPage from "./pages/MainPage";
import TapToOpenPage from "./pages/TapToOpenPage";

const criticalImages = [
  { path: "initial-bg-image.webp", label: "opening background" },
  { path: "RedRibbion-poster.webp", label: "ribbon preview" },
  { path: "first-page.webp", label: "invitation background" },
  { path: "groom-bride.webp", label: "couple illustration" },
  { path: "swastik.png", label: "invitation emblem" },
];

function preloadImage(path: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    const decodeImage = () => {
      if (typeof image.decode === "function") {
        void image.decode().then(resolve, reject);
      } else {
        resolve();
      }
    };

    image.onload = decodeImage;
    image.onerror = () => reject(new Error(`Unable to load ${path}`));
    image.src = `${import.meta.env.BASE_URL}${path}`;

    if (image.complete) {
      if (image.naturalWidth > 0) {
        decodeImage();
      } else {
        reject(new Error(`Unable to load ${path}`));
      }
    }
  });
}

function App() {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(2700);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCurrentAttempt = true;

    const loadCriticalImages = async () => {
      const results = await Promise.all(
        criticalImages.map(async ({ path, label }) => {
          try {
            await preloadImage(path);
            return null;
          } catch (error) {
            console.error(`Failed to preload ${label}:`, error);
            return label;
          } finally {
            if (isCurrentAttempt) {
              setLoadedImages((count) => count + 1);
            }
          }
        }),
      );

      if (!isCurrentAttempt) return;

      const failures = results.filter((label): label is string => label !== null);
      setFailedImages(failures);
      setIsReady(failures.length === 0);
    };

    void loadCriticalImages();
    return () => {
      isCurrentAttempt = false;
    };
  }, [loadAttempt]);

  if (!isReady) {
    const progress = Math.round((loadedImages / criticalImages.length) * 100);

    return (
      <main
        className="asset-loader"
        aria-busy={failedImages.length === 0}
        aria-live="polite"
      >
        <div className="asset-loader-card">
          <span className="asset-loader-flourish" aria-hidden="true">❧</span>
          <h1>{failedImages.length > 0 ? "A little pause..." : "Preparing your invitation"}</h1>
          {failedImages.length > 0 ? (
            <>
              <p role="alert">
                Some images could not be loaded: {failedImages.join(", ")}.
              </p>
              <button
                className="asset-loader-retry"
                type="button"
                onClick={() => {
                  setLoadedImages(0);
                  setFailedImages([]);
                  setIsReady(false);
                  setLoadAttempt((attempt) => attempt + 1);
                }}
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <p>Just a moment while we get everything ready.</p>
              <progress
                className="asset-loader-progress"
                value={loadedImages}
                max={criticalImages.length}
                aria-label="Loading invitation"
              />
              <span className="asset-loader-percent">{progress}%</span>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="h-full min-h-dvh overflow-hidden bg-cream font-['Lora',serif] text-maroon">
      <div className="invitation-scenes">
        <div
          aria-hidden={!isOpen}
          className={`invitation-scene ${isOpening || isOpen ? "is-visible" : ""}`}
          inert={!isOpen}
          style={{ transitionDuration: `${transitionDuration}ms` }}
        >
          <FallingSakura>
            <MainPage />
          </FallingSakura>
        </div>
        <div
          aria-hidden={isOpen}
          className={`invitation-scene invitation-opening ${isOpening || isOpen ? "" : "is-visible"}`}
          inert={isOpen}
          style={{ transitionDuration: `${transitionDuration}ms` }}
        >
          <TapToOpenPage
            onOpenStart={(duration) => {
              setTransitionDuration(duration);
              setIsOpening(true);
            }}
            onOpenComplete={() => setIsOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
