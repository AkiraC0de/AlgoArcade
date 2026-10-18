export type HashAlgorithmId = "ascii-sum" | "polynomial" | "djb2" | "fnv1a";

export type HashStepKind = "start" | "character" | "done";

export interface HashStep {
  kind: HashStepKind;
  index: number;
  character?: string;
  code?: number;
  before: number;
  after: number;
  formula: string;
  note: string;
}

export interface HashResult {
  algorithm: HashAlgorithmId;
  input: string;
  steps: HashStep[];
  hash: number;
  bucket: number;
  tableSize: number;
  hex: string;
}

export interface HashAlgorithmInfo {
  id: HashAlgorithmId;
  label: string;
  description: string;
  formula: string;
  initial: number;
}

export const HASH_ALGORITHMS: HashAlgorithmInfo[] = [
  {
    id: "ascii-sum",
    label: "ASCII / Unicode sum",
    description: "Adds the numeric code of every character. Simple to see, but easy for different strings to collide.",
    formula: "h ← h + code(character)",
    initial: 0,
  },
  {
    id: "polynomial",
    label: "Polynomial rolling hash",
    description: "Gives earlier characters more weight by multiplying the running value by a base before adding the next code.",
    formula: "h ← (h × 31 + code(character)) mod 2³²",
    initial: 0,
  },
  {
    id: "djb2",
    label: "DJB2",
    description: "Starts from a non-zero seed and repeatedly multiplies by 33 before adding the next character code.",
    formula: "h ← (h × 33) + code(character)",
    initial: 5381,
  },
  {
    id: "fnv1a",
    label: "FNV-1a",
    description: "XORs each character into the running value, then multiplies by a fixed prime for strong bit mixing.",
    formula: "h ← (h XOR code) × 16,777,619 mod 2³²",
    initial: 2166136261,
  },
];

function codeOf(character: string): number {
  return character.codePointAt(0) ?? 0;
}

function uint32(value: number): number {
  return value >>> 0;
}

function algorithmInfo(algorithm: HashAlgorithmId): HashAlgorithmInfo {
  return HASH_ALGORITHMS.find((item) => item.id === algorithm) ?? HASH_ALGORITHMS[0];
}

function nextHash(algorithm: HashAlgorithmId, current: number, code: number): number {
  if (algorithm === "ascii-sum") return current + code;
  if (algorithm === "polynomial") return uint32(Math.imul(current, 31) + code);
  if (algorithm === "djb2") return uint32(Math.imul(current, 33) + code);
  return uint32(Math.imul(current ^ code, 16777619));
}

function computationFormula(algorithm: HashAlgorithmId, before: number, code: number, after: number): string {
  if (algorithm === "ascii-sum") return `${before} + ${code} = ${after}`;
  if (algorithm === "polynomial") return `(${before} × 31 + ${code}) mod 2³² = ${after}`;
  if (algorithm === "djb2") return `(${before} × 33 + ${code}) mod 2³² = ${after}`;
  return `(${before} XOR ${code}) × 16,777,619 mod 2³² = ${after}`;
}

export function runHash(input: string, algorithm: HashAlgorithmId, tableSize = 8): HashResult {
  const safeTableSize = Math.max(1, Math.floor(tableSize));
  const info = algorithmInfo(algorithm);
  const characters = Array.from(input);
  const steps: HashStep[] = [
    {
      kind: "start",
      index: -1,
      before: info.initial,
      after: info.initial,
      formula: `seed = ${info.initial}`,
      note: `${info.label}: start with seed ${info.initial}. Process ${characters.length} character${characters.length === 1 ? "" : "s"}.`,
    },
  ];

  let hash = info.initial;
  characters.forEach((character, index) => {
    const code = codeOf(character);
    const before = hash;
    hash = nextHash(algorithm, hash, code);
    steps.push({
      kind: "character",
      index,
      character,
      code,
      before,
      after: hash,
      formula: computationFormula(algorithm, before, code, hash),
      note: `Character ${index + 1}: “${character}” has code ${code}; accumulator becomes ${hash}.`,
    });
  });

  const bucket = hash % safeTableSize;
  steps.push({
    kind: "done",
    index: -1,
    before: hash,
    after: hash,
    formula: `${hash} mod ${safeTableSize} = bucket ${bucket}`,
    note: `Hash complete: ${hash}. Table size ${safeTableSize} places the input in bucket ${bucket}.`,
  });

  return {
    algorithm,
    input,
    steps,
    hash,
    bucket,
    tableSize: safeTableSize,
    hex: `0x${hash.toString(16).toUpperCase()}`,
  };
}
