import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => (
  <ToastContext.Provider value={toast}>
    {children}
    <Toaster position="bottom-right" />
  </ToastContext.Provider>
);

export const useToast = () => useContext(ToastContext);