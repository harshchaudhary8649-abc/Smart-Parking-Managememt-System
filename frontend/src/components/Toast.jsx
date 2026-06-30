import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}
