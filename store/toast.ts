import { create } from "zustand";

export type TToastTone = "success" | "error";

export type TToastItem = {
  id: string;
  tone: TToastTone;
  message: string;
};

type TToastState = {
  items: TToastItem[];
  show: (tone: TToastTone, message: string) => void;
  dismiss: (id: string) => void;
};

const MAX_TOASTS = 3;

export const useToastStore = create<TToastState>((set) => ({
  items: [],
  show: (tone, message) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      items: [...state.items, { id, tone, message: trimmed }].slice(-MAX_TOASTS),
    }));
  },
  dismiss: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));

export const toast = {
  success: (message: string) => {
    useToastStore.getState().show("success", message);
  },
  error: (error: unknown, fallback = "Something went wrong") => {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : typeof error === "string" && error.trim()
          ? error
          : fallback;

    useToastStore.getState().show("error", message);
  },
};
