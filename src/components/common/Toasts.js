import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toasts = () => {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton={false}
        theme="light"
        limit={3}
        toastClassName="!bg-white/95 !backdrop-blur-md !rounded-xl !shadow-lg !shadow-black/10 !border !border-white/20 !text-gray-700 !font-medium !text-sm !p-4 !my-2 !min-h-[60px]"
        bodyClassName="!p-0 !m-0"
        progressClassName="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !h-1"
        style={{
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          maxWidth: "90vw",
        }}
      />

      <style jsx global>{`
        .Toastify__toast-container {
          @apply font-sans;
        }

        .Toastify__toast--success {
          @apply !bg-green-50/95 !border-l-4 !border-l-green-500 !text-green-800;
        }

        .Toastify__toast--error {
          @apply !bg-red-50/95 !border-l-4 !border-l-red-500 !text-red-800;
        }

        .Toastify__toast--warning {
          @apply !bg-yellow-50/95 !border-l-4 !border-l-yellow-500 !text-yellow-800;
        }

        .Toastify__toast--info {
          @apply !bg-blue-50/95 !border-l-4 !border-l-blue-500 !text-blue-800;
        }
      `}</style>
    </>
  );
};

export default Toasts;
