/**
 * Production Isolation Forest implementation (Liu, Ting, Zhou 2008)
 * for unsupervised anomaly detection on cybersecurity feature vectors.
 */

export interface iTreeNode {
  isLeaf: boolean;
  size: number;
  featureIndex?: number;
  splitValue?: number;
  left?: iTreeNode;
  right?: iTreeNode;
}

export class IsolationForest {
  private nTrees: number;
  private subsampleSize: number;
  private maxHeight: number;
  private trees: iTreeNode[] = [];
  private contamination: number;
  private threshold: number = 0.55;

  constructor(nTrees = 100, subsampleSize = 64, contamination = 0.15) {
    this.nTrees = nTrees;
    this.subsampleSize = subsampleSize;
    this.contamination = contamination;
    this.maxHeight = Math.ceil(Math.log2(Math.max(subsampleSize, 2)));
  }

  /**
   * Average path length of unsuccessful searches in a Binary Search Tree
   * c(n) = 2 * (ln(n - 1) + Euler_gamma) - (2 * (n - 1) / n)
   */
  public static c(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    const eulerGamma = 0.57721566490153286;
    return 2.0 * (Math.log(n - 1) + eulerGamma) - (2.0 * (n - 1)) / n;
  }

  public fit(X: number[][]): this {
    const nSamples = X.length;
    if (nSamples === 0) return this;
    const actualSubsample = Math.min(this.subsampleSize, nSamples);
    this.maxHeight = Math.ceil(Math.log2(actualSubsample));
    this.trees = [];

    for (let t = 0; t < this.nTrees; t++) {
      // Subsample with or without replacement
      const sampleIndices = this.sampleWithoutReplacement(nSamples, actualSubsample);
      const sampleData = sampleIndices.map((idx) => X[idx]);
      const tree = this.buildTree(sampleData, 0, this.maxHeight);
      this.trees.push(tree);
    }

    // Determine threshold based on contamination factor
    const scores = X.map((row) => this.anomalyScore(row));
    const sortedScores = [...scores].sort((a, b) => a - b);
    const thresholdIndex = Math.max(0, Math.floor(sortedScores.length * (1 - this.contamination)));
    this.threshold = sortedScores[thresholdIndex] || 0.55;

    return this;
  }

  private sampleWithoutReplacement(max: number, count: number): number[] {
    const indices: number[] = [];
    const pool = Array.from({ length: max }, (_, i) => i);
    for (let i = 0; i < count; i++) {
      const randIdx = Math.floor(Math.random() * pool.length);
      indices.push(pool[randIdx]);
      pool.splice(randIdx, 1);
    }
    return indices;
  }

  private buildTree(X: number[][], currentHeight: number, maxHeight: number): iTreeNode {
    const nSamples = X.length;
    if (nSamples <= 1 || currentHeight >= maxHeight) {
      return { isLeaf: true, size: nSamples };
    }

    const nFeatures = X[0].length;
    // Check if all data points are identical
    let allIdentical = true;
    for (let i = 1; i < nSamples; i++) {
      for (let f = 0; f < nFeatures; f++) {
        if (X[i][f] !== X[0][f]) {
          allIdentical = false;
          break;
        }
      }
      if (!allIdentical) break;
    }
    if (allIdentical) {
      return { isLeaf: true, size: nSamples };
    }

    // Pick a random feature that has non-constant values
    let attempts = 0;
    let feat = 0;
    let minVal = 0;
    let maxVal = 0;

    while (attempts < 10) {
      feat = Math.floor(Math.random() * nFeatures);
      const values = X.map((row) => row[feat]);
      minVal = Math.min(...values);
      maxVal = Math.max(...values);
      if (maxVal > minVal) break;
      attempts++;
    }

    if (maxVal <= minVal) {
      return { isLeaf: true, size: nSamples };
    }

    // Random split value between minVal and maxVal
    const splitValue = minVal + Math.random() * (maxVal - minVal);
    const leftData = X.filter((row) => row[feat] < splitValue);
    const rightData = X.filter((row) => row[feat] >= splitValue);

    if (leftData.length === 0 || rightData.length === 0) {
      return { isLeaf: true, size: nSamples };
    }

    return {
      isLeaf: false,
      size: nSamples,
      featureIndex: feat,
      splitValue,
      left: this.buildTree(leftData, currentHeight + 1, maxHeight),
      right: this.buildTree(rightData, currentHeight + 1, maxHeight),
    };
  }

  private pathLength(x: number[], node: iTreeNode, currentHeight: number): number {
    if (node.isLeaf || !node.left || !node.right || node.featureIndex === undefined || node.splitValue === undefined) {
      return currentHeight + IsolationForest.c(node.size);
    }

    const featVal = x[node.featureIndex];
    if (featVal < node.splitValue) {
      return this.pathLength(x, node.left, currentHeight + 1);
    } else {
      return this.pathLength(x, node.right, currentHeight + 1);
    }
  }

  /**
   * Returns anomaly score s between 0 and 1.
   * Values close to 1 are anomalies.
   * Values much smaller than 0.5 are normal.
   */
  public anomalyScore(x: number[]): number {
    if (this.trees.length === 0) return 0.5;
    let totalPath = 0;
    for (const tree of this.trees) {
      totalPath += this.pathLength(x, tree, 0);
    }
    const avgPath = totalPath / this.trees.length;
    const cN = IsolationForest.c(this.subsampleSize);
    if (cN === 0) return 0.5;

    // s(x, n) = 2^(- E(h(x)) / c(n))
    return Math.pow(2, -avgPath / cN);
  }

  /**
   * Returns true if anomalous
   */
  public isAnomaly(x: number[]): boolean {
    return this.anomalyScore(x) >= this.threshold;
  }

  /**
   * Returns risk score scaled 0 - 100
   */
  public riskScore(x: number[]): number {
    const rawScore = this.anomalyScore(x);
    // Sigmoidal or linear scale mapping around threshold
    const scaled = Math.min(100, Math.max(0, Math.round((rawScore - 0.35) * 160)));
    return scaled;
  }

  public getThreshold(): number {
    return this.threshold;
  }
}
