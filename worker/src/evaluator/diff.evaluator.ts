export class DiffEvaluator {
  /**
   * Compares actual program stdout against expected testcase output
   * Normalizes line breaks and trims trailing spaces
   */
  static evaluate(actualOutput: string, expectedOutput: string): boolean {
    const normalize = (text: string) =>
      text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line, idx, arr) => idx < arr.length - 1 || line.length > 0)
        .join('\n')
        .trim();

    return normalize(actualOutput) === normalize(expectedOutput);
  }
}
