export class FordJohnsonSorter {
  private comparisonCount: number = 0;
  private steps: VisualStep[] = [];

  public getComparisonCount(): number {
    return this.comparisonCount;
  }

  public resetComparisonCount(): void {
    this.comparisonCount = 0;
    this.steps = [];
  }

  public getSteps(): VisualStep[] {
    return this.steps;
  }

  private logStep(step: VisualStep): void {
    this.steps.push(step);
  }

  private getJacobsthalNumbers(size: number): number[] {
    let J0 = 0;
    let J1 = 1;
    const seq = [J0, J1];

    while (J1 < size) {
      const J2 = J1 + 2 * J0;
      seq.push(J2);
      J0 = J1;
      J1 = J2;
    }
    return seq;
  }

  private computeJacobsthalOrder(size: number): number[] {
    const jacobsthal = this.getJacobsthalNumbers(size);
    const order: number[] = [];
    const usedIndices = new Set<number>();
    let remaining = size;
    let i = 1;

    while (i < jacobsthal.length && remaining > 0) {
      const start = Math.min(jacobsthal[i], remaining - 1);
      const end = jacobsthal[i - 1];

      if (start >= end) {
        for (let j = start; j >= end; --j) {
          if (j < remaining && !usedIndices.has(j)) {
            order.push(j);
            usedIndices.add(j);
          }
        }
      }
      remaining = jacobsthal[i];
      i++;
    }

    for (let j = size - 1; j >= 0; --j) {
      if (!usedIndices.has(j)) {
        order.push(j);
        usedIndices.add(j);
      }
    }

    return order;
  }

  private binaryInsert(arr: number[], element: number): void {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      this.comparisonCount++;
      this.logStep({ type: 'compare', values: [element, arr[mid]], indices: [null, mid] });

      if (arr[mid] < element) low = mid + 1;
      else high = mid - 1;
    }

    arr.splice(low, 0, element);
    this.logStep({ type: 'insert', values: [element], indices: [low], array: [...arr] });
  }

  public sort(input: number[]): number[] {
    this.resetComparisonCount();

    if (input.length <= 2) {
      if (input.length === 2 && input[0] > input[1]) {
        this.comparisonCount++;
        this.logStep({ type: 'compare', values: [input[0], input[1]], indices: [0, 1] });

        const temp = input[0];
        input[0] = input[1];
        input[1] = temp;
        this.logStep({ type: 'swap', indices: [0, 1], array: [...input], values: []});
      }
      return input;
    }

    const mainChain: number[] = [];
    const losers: number[] = [];
    let oddElement: number | null = null;

    for (let i = 0; i < input.length; i += 2) {
      if (i + 1 >= input.length) {
        oddElement = input[i];
        break;
      }

      this.comparisonCount++;
      this.logStep({ type: 'compare', values: [input[i], input[i + 1]], indices: [i, i + 1] });

      if (input[i] <= input[i + 1]) {
        mainChain.push(input[i + 1]);
        losers.push(input[i]);
      } else {
        mainChain.push(input[i]);
        losers.push(input[i + 1]);
      }
    }

    const sortedMain = this.sort(mainChain);
    const result = [...sortedMain];
    const insertionOrder = this.computeJacobsthalOrder(losers.length);

    for (const idx of insertionOrder) {
      if (idx < losers.length) {
        this.binaryInsert(result, losers[idx]);
      }
    }

    if (oddElement !== null) {
      this.binaryInsert(result, oddElement);
    }

    return result;
  }
}

export interface VisualStep {
  type: 'compare' | 'insert' | 'swap';
  values: number[];
  indices: (number | null)[];
  array?: number[];
}
