import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toasts = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
};

export default Toasts;
