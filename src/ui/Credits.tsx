import { useState } from "react";

export function Credits() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="credits" onClick={() => setOpen(true)}>
        Built on{" "}
        <strong>Z-Anatomy</strong> · <strong>BodyParts3D</strong>{" "}
        <span className="credits__cc">CC BY-SA</span>
      </button>

      {open && (
        <div
          className="modal-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="About & attributions"
          >
            <button
              className="modal__close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="modal__title">About this explorer</h2>
            <p className="modal__lead">
              An interactive 3D atlas of the human brain. Orbit, select any
              structure to fly the camera in, isolate it, slice through it, or
              explode the brain into its parts.
            </p>

            <h3 className="modal__h3">Anatomical model</h3>
            <ul className="modal__list">
              <li>
                <a
                  href="https://www.z-anatomy.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Z-Anatomy
                </a>{" "}
                — © Gauthier Kervyn / Z-Anatomy contributors. Licensed{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  CC BY-SA 4.0
                </a>
                .
              </li>
              <li>
                <a
                  href="https://lifesciencedb.jp/bp3d/"
                  target="_blank"
                  rel="noreferrer"
                >
                  BodyParts3D
                </a>{" "}
                — © The Database Center for Life Science (DBCLS), Japan. Licensed{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/2.1/jp/"
                  target="_blank"
                  rel="noreferrer"
                >
                  CC BY-SA 2.1 Japan
                </a>
                .
              </li>
              <li>Anatomical naming follows Terminologia Anatomica.</li>
            </ul>
            <p className="modal__note">
              These models are ShareAlike — derivatives must carry the same
              license. Full credit ledger lives in <code>ATTRIBUTIONS.md</code>.
            </p>

            <h3 className="modal__h3">Built with</h3>
            <p className="modal__tech">
              React · three.js · @react-three/fiber · drei · zustand · Vite
            </p>
          </div>
        </div>
      )}
    </>
  );
}
