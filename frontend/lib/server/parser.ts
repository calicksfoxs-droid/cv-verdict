import { ParsedCv } from "./types";

const sectionAliases: Record<string, string[]> = {
  contact: ["contact", "contact information"],
  summary: ["summary", "professional summary", "profile"],
  experience: ["experience", "work experience", "project experience"],
  projects: ["projects", "project"],
  education: ["education"],
  skills: ["skills", "technical skills"],
  certifications: ["certifications", "certificates"],
  languages: ["languages"],
};

export function parseCvText(text: string): ParsedCv {
  const lower = text.toLowerCase();
  const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text);
  const phone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);
  const links = text.match(/https?:\/\/\S+|(?:linkedin\.com\/\S+)|(?:github\.com\/\S+)/gi) ?? [];
  const sections = Object.fromEntries(Object.entries(sectionAliases).map(([key, aliases]) => [key, aliases.some((alias) => lower.includes(alias))]));
  const bullet_points = text.split(/\r?\n/).filter((line) => /^\s*[-•]/.test(line)).map((line) => line.replace(/^\s*[-•]\s*/, "").trim());
  const numbers = text.match(/\b\d+(?:[,.]\d+)?%?\b/g) ?? [];
  const dates = text.match(/\b(?:19|20)\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d{2}\b/gi) ?? [];
  const buzzwords = text.match(/\b(?:expert|advanced|specialist|guru|rockstar|ninja|results-driven|hardworking|passionate|fast learner|team player)\b/gi) ?? [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  return {
    contact_information: {
      email_found: email,
      phone_found: phone,
      links,
    },
    sections,
    bullet_points,
    numbers,
    dates,
    buzzwords: Array.from(new Set(buzzwords.map((word) => word.toLowerCase()))).sort(),
    word_count: text.split(/\s+/).filter(Boolean).length,
    line_count: lines.length,
    source_references: [],
    parsing_quality: {
      overall_confidence: 0.78,
      warnings: ["MVP parser: structured extraction will be expanded in the AI parser phase."],
    },
  };
}
