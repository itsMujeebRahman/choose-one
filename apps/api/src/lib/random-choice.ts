export function parseOptions(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 2 || value.length > 10) {
    throw new Error("Enter between 2 and 10 options.");
  }
  const options = value.map((option) => {
    if (
      typeof option !== "string" ||
      !option.trim() ||
      option.trim().length > 120
    ) {
      throw new Error("Each option must contain between 1 and 120 characters.");
    }
    return option.trim();
  });
  if (
    new Set(options.map((option) => option.toLowerCase())).size !==
    options.length
  ) {
    throw new Error("Give each option a different name.");
  }
  return options;
}

export function chooseRandomOption(options: readonly string[]) {
  if (options.length < 2 || options.length > 10)
    throw new Error("Enter between 2 and 10 options.");
  // Rejection sampling gives each option the same probability without modulo bias.
  const range = 2 ** 32;
  const limit = range - (range % options.length);
  const sample = new Uint32Array(1);
  do {
    crypto.getRandomValues(sample);
  } while (sample[0] >= limit);
  const index = sample[0] % options.length;
  return { option: options[index], index };
}
