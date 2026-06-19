"use client";
const KEY = "droprush_uid";
export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}