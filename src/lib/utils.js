import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getTodayDateFormatted = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`; // "DD-MM-YYYY"
};

export function parseDateFromString(dateStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is 0-based in JS
}

export function formatDateToString(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // JS months are 0-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
