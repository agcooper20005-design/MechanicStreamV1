import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Icon from "../components/Icon";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("mechanicstream-theme") || "light");
  const [textSize, setTextSize] = useState(() => localStorage.getItem("mechanicstream-text-size") || "normal");
  const [confirmation, setConfirmation] = useState(null);
  const [toasts, setToasts] = useState([]);
  const confirmationResolver = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("mechanicstream-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
    localStorage.setItem("mechanicstream-text-size", textSize);
  }, [textSize]);

  const confirmAction = useCallback((options) => {
    if (confirmationResolver.current) {
      confirmationResolver.current(false);
    }
    return new Promise((resolve) => {
      confirmationResolver.current = resolve;
      setConfirmation({
        title: "Confirm action",
        message: "Are you sure you want to continue?",
        confirmLabel: "Confirm",
        tone: "primary",
        ...options,
      });
    });
  }, []);

  const resolveConfirmation = useCallback((answer) => {
    confirmationResolver.current?.(answer);
    confirmationResolver.current = null;
    setConfirmation(null);
  }, []);

  const notify = useCallback((message, tone = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
      textSize,
      setTextSize,
      toggleTextSize: () => setTextSize((current) => (current === "normal" ? "large" : "normal")),
      confirmAction,
      notify,
    }),
    [theme, textSize, confirmAction, notify],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {confirmation && (
        <div
          className="dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) resolveConfirmation(false);
          }}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <span className={`confirm-icon confirm-${confirmation.tone}`}>
              <Icon name={confirmation.tone === "danger" ? "warning" : "check"} size={24} />
            </span>
            <div>
              <h2 id="confirm-title">{confirmation.title}</h2>
              <p id="confirm-message">{confirmation.message}</p>
              {confirmation.details && <div className="confirm-details">{confirmation.details}</div>}
            </div>
            <div className="confirm-actions">
              <button className="button button-secondary" type="button" onClick={() => resolveConfirmation(false)}>
                Go back
              </button>
              <button
                className={`button ${confirmation.tone === "danger" ? "button-danger" : "button-primary"}`}
                type="button"
                onClick={() => resolveConfirmation(true)}
                autoFocus
              >
                {confirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <Icon name={toast.tone === "error" ? "warning" : "check"} size={18} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider.");
  return context;
}
