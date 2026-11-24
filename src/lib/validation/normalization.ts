export function normalize(input: string) {
  return input.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
}
