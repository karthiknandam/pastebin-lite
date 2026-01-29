import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { postPasteResponse } from "./api";
import { persist } from "zustand/middleware";

type State = {
  urls: Array<postPasteResponse>;
};

type Actions = {
  setUrl: (url: postPasteResponse) => void;
};

export const useUrlStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      urls: [],
      setUrl: (url) =>
        set((state) => {
          state.urls.push(url);
        }),
    })),
    { name: "paste-urls" },
  ),
);
