import { toast } from "react-toastify";

type ToastType = "success" | "error" | "warning" | "info" | "facebook";

const toastOptions = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const inlineStyle: Record<string, React.CSSProperties> = {
  success: { backgroundColor: "#28a745", color: "white" },
  error: { backgroundColor: "#dc3545", color: "white" },
  warning: { backgroundColor: "#ffc107", color: "black" },
  info: { backgroundColor: "white", color: "black" },
  facebook: { backgroundColor: "#0866ff", color: "white" },
};

export function showToast(message: string, type: ToastType = "info") {
  switch (type) {
    case "success":
      toast.success(message, { ...toastOptions, style: inlineStyle.success });
      break;
    case "error":
      toast.error(message, { ...toastOptions, style: inlineStyle.error });
      break;
    case "warning":
      toast.warning(message, { ...toastOptions, style: inlineStyle.warning });
      break;
    case "facebook":
      toast.warning(message, {
        ...toastOptions,
        style: inlineStyle.facebook,
        icon: false,
      });
      break;
    default:
      toast.info(message, { ...toastOptions, style: inlineStyle.info });
  }
}
