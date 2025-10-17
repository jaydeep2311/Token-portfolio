import { useContext } from "react";
import { ToastContext } from "../components/Toast";

export const useToast = () => {
  return useContext(ToastContext);
};

export default useToast;
