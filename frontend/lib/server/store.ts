import { AnalysisRecord } from "./types";

const globalStore = globalThis as typeof globalThis & {
  cvVerdictStore?: Map<string, AnalysisRecord>;
};

export const STORE = globalStore.cvVerdictStore ?? new Map<string, AnalysisRecord>();
globalStore.cvVerdictStore = STORE;
