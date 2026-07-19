"use client";

import { CircleState } from "./types";
import { initialState } from "./demo-data";

const KEY = "lifeline-demo-v1";

export function loadState(): CircleState {
  if (typeof window === "undefined") return initialState;
  try {
    const value = window.localStorage.getItem(KEY);
    return value ? JSON.parse(value) : initialState;
  } catch {
    return initialState;
  }
}

export function saveState(state: CircleState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  window.localStorage.removeItem(KEY);
}
