export const GAME_DURATION_SECONDS = 30;
export const QUESTION_START_BUFFER_SECONDS = 5;
export const MAX_PLAYERS = 250;

export function makeCode(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function makeToken(length = 32) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function scoreFor(guess: number, correct: number) {
  const d = Math.abs(guess - correct);
  return Math.max(0, 100 - d * 4);
}

export function quizScore(secondsRemaining: number, correct: boolean) {
  if (!correct) return 0;
  return 50 + Math.floor((Math.max(0, Math.min(30, secondsRemaining)) / 30) * 50);
}
