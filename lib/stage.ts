import { RoundKey, STAGES } from "./rounds";

export function stageBase(stage: RoundKey) {
  return STAGES.indexOf(stage) * 10;
}

export function stageForRound(round: number): RoundKey {
  return STAGES[Math.min(STAGES.length - 1, Math.floor(round / 10))];
}

export function questionIndex(round: number) {
  return round % 10;
}

export function nextStage(stage: RoundKey): RoundKey | null {
  const i = STAGES.indexOf(stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
}
