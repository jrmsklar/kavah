"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { X, Loader2, Check } from "lucide-react";

export const toaster = createToaster({
  overlap: true,
  placement: "bottom-end",
  gap: 16,
});

export function ToastProvider() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root className="bg-linear-to-r from-white to-gray-50 border-l-4 border-blue-500 rounded-lg shadow-lg min-w-80 p-4 relative overflow-anywhere transition-all duration-300 ease-default will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index)">
            <div className="flex items-start gap-3">
              {toast.type === "loading" && (
                <Loader2 className="w-4 h-4 mt-0.5 text-blue-500 animate-spin shrink-0" />
              )}
              {toast.type === "success" && (
                <div className="w-4 h-4 mt-0.5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-4 h-4 mt-0.5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <Toast.Title className="text-gray-900 font-semibold text-sm">
                  {toast.title}
                </Toast.Title>
                <Toast.Description className="text-gray-600 text-sm mt-1">
                  {toast.description}
                </Toast.Description>
              </div>
            </div>
            <Toast.CloseTrigger className="absolute top-3 right-3 p-1 hover:bg-white/50 rounded transition-colors text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </Portal>
  );
}
