import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import slugify from "slugify";
import { remove as removeDiacritics } from "diacritics";
import { ChartConfig } from "@/components/ui/chart";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY")
}



export function slugifyText(text: string) {
  // title: Çalışma Raporu
  // slug: calisma-raporu
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    locale: "tr",
  });
}

export function pascalCase(str: string) {
  // "calisma-raporu"
  // "CalismaRaporu"
  return str
    .split(/[\s-_]+/) // split by space, dash, underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}


// utils/userAgent.ts
export function getUserAgentAsJson(ua: string) {
  let browser = "Unknown";
  let version = "";
  let os = "Unknown";
  let device = "Desktop";

  // --- Browser detection ---
  if (/Edg\/(\d+)/.test(ua)) {
    browser = "Edge";
    version = ua.match(/Edg\/(\d+)/)?.[1] || "";
  } else if (/OPR\/(\d+)/.test(ua)) {
    browser = "Opera";
    version = ua.match(/OPR\/(\d+)/)?.[1] || "";
  } else if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua) && !/OPR/.test(ua)) {
    browser = "Chrome";
    version = ua.match(/Chrome\/(\d+)/)?.[1] || "";
  } else if (/Firefox\/(\d+)/.test(ua)) {
    browser = "Firefox";
    version = ua.match(/Firefox\/(\d+)/)?.[1] || "";
  } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
    browser = "Safari";
    version = ua.match(/Version\/(\d+)/)?.[1] || "";
  }

  // --- OS detection ---
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

  // --- Device type ---
  if (/Mobile/.test(ua)) device = "Mobile";
  else if (/Tablet/.test(ua)) device = "Tablet";

  return {
    browser,
    version,
    os,
    device,
  };
}

export function normalizeTurkish(input: string) {
  if (!input) return "";
  return removeDiacritics(
    input
      .toLocaleLowerCase("tr") // important: Turkish locale
      .trim()
  );
}

