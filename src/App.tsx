import { useState } from "react";
import FallingSakura from "./components/FallingSakura";
import MainPage from "./pages/MainPage";
import TapToOpenPage from "./pages/TapToOpenPage";

function App() {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(2700);

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
