export type RoundingUnit = 0.1 | 1 | 10 | 100;

export function roundingUnitFromSelect(value: string): RoundingUnit {
  switch (value) {
    case '0.1':
      return 0.1;
    case '1':
      return 1;
    case '10':
      return 10;
    case '100':
      return 100;
    default:
      return 0.1;
  }
}
