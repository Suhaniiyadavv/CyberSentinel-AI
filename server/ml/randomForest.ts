/**
 * Production Random Forest Classifier implementation
 * with Gini Impurity splits and Mean Decrease in Impurity (MDI) feature importances.
 */

export interface DecisionTreeNode {
  isLeaf: boolean;
  prediction?: string;
  probabilities?: Record<string, number>;
  featureIndex?: number;
  splitValue?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

export class RandomForestClassifier {
  private nTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;
  private trees: DecisionTreeNode[] = [];
  private classes: string[] = [];
  private featureNames: string[] = [];
  private featureImportances: number[] = [];

  constructor(nTrees = 40, maxDepth = 10, minSamplesSplit = 2) {
    this.nTrees = nTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public fit(X: number[][], y: string[], featureNames: string[]): this {
    if (X.length === 0 || y.length === 0) return this;
    this.featureNames = featureNames;
    this.classes = Array.from(new Set(y)).sort();
    const nFeatures = X[0].length;
    this.featureImportances = new Array(nFeatures).fill(0);
    this.trees = [];

    const nSamples = X.length;
    const maxFeaturesPerSplit = Math.max(1, Math.floor(Math.sqrt(nFeatures)));

    for (let t = 0; t < this.nTrees; t++) {
      // Bootstrap sample (with replacement)
      const bootIndices: number[] = [];
      for (let i = 0; i < nSamples; i++) {
        bootIndices.push(Math.floor(Math.random() * nSamples));
      }
      const bootX = bootIndices.map((i) => X[i]);
      const bootY = bootIndices.map((i) => y[i]);

      const tree = this.buildDecisionTree(bootX, bootY, 0, maxFeaturesPerSplit);
      this.trees.push(tree);
    }

    // Normalize feature importances
    const totalImportance = this.featureImportances.reduce((a, b) => a + b, 0);
    if (totalImportance > 0) {
      this.featureImportances = this.featureImportances.map((val) => val / totalImportance);
    } else {
      this.featureImportances = this.featureImportances.map(() => 1 / nFeatures);
    }

    return this;
  }

  private buildDecisionTree(
    X: number[][],
    y: string[],
    depth: number,
    maxFeatures: number
  ): DecisionTreeNode {
    const nSamples = X.length;
    const uniqueClasses = Array.from(new Set(y));

    // Base cases
    if (uniqueClasses.length === 1 || depth >= this.maxDepth || nSamples < this.minSamplesSplit) {
      return this.createLeafNode(y);
    }

    const nFeatures = X[0].length;
    // Random feature subset
    const featureIndices = this.sampleRandomFeatures(nFeatures, maxFeatures);

    const parentGini = this.calculateGini(y);
    let bestGain = -1;
    let bestFeature = -1;
    let bestSplitValue = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    for (const feat of featureIndices) {
      const values = X.map((row) => row[feat]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      if (uniqueValues.length <= 1) continue;

      // Evaluate candidate split points between consecutive unique values
      const candidateSplits: number[] = [];
      const step = Math.max(1, Math.floor(uniqueValues.length / 10));
      for (let i = 0; i < uniqueValues.length - 1; i += step) {
        candidateSplits.push((uniqueValues[i] + uniqueValues[i + 1]) / 2);
      }

      for (const splitVal of candidateSplits) {
        const leftIdx: number[] = [];
        const rightIdx: number[] = [];
        for (let i = 0; i < nSamples; i++) {
          if (X[i][feat] < splitVal) leftIdx.push(i);
          else rightIdx.push(i);
        }

        if (leftIdx.length === 0 || rightIdx.length === 0) continue;

        const leftY = leftIdx.map((i) => y[i]);
        const rightY = rightIdx.map((i) => y[i]);
        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);

        const weightedGini =
          (leftIdx.length / nSamples) * leftGini + (rightIdx.length / nSamples) * rightGini;
        const gain = parentGini - weightedGini;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feat;
          bestSplitValue = splitVal;
          bestLeftIndices = leftIdx;
          bestRightIndices = rightIdx;
        }
      }
    }

    if (bestGain <= 0 || bestFeature === -1) {
      return this.createLeafNode(y);
    }

    // Accumulate MDI importance
    this.featureImportances[bestFeature] += bestGain * (nSamples / (this.nTrees * 100));

    const leftX = bestLeftIndices.map((i) => X[i]);
    const leftY = bestLeftIndices.map((i) => y[i]);
    const rightX = bestRightIndices.map((i) => X[i]);
    const rightY = bestRightIndices.map((i) => y[i]);

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      splitValue: bestSplitValue,
      left: this.buildDecisionTree(leftX, leftY, depth + 1, maxFeatures),
      right: this.buildDecisionTree(rightX, rightY, depth + 1, maxFeatures),
    };
  }

  private createLeafNode(y: string[]): DecisionTreeNode {
    const counts: Record<string, number> = {};
    for (const cls of this.classes) counts[cls] = 0;
    for (const label of y) counts[label] = (counts[label] || 0) + 1;

    let maxClass = this.classes[0];
    let maxCount = -1;
    const probs: Record<string, number> = {};

    for (const cls of this.classes) {
      const p = counts[cls] / (y.length || 1);
      probs[cls] = p;
      if (counts[cls] > maxCount) {
        maxCount = counts[cls];
        maxClass = cls;
      }
    }

    return {
      isLeaf: true,
      prediction: maxClass,
      probabilities: probs,
    };
  }

  private calculateGini(y: string[]): number {
    if (y.length === 0) return 0;
    const counts: Record<string, number> = {};
    for (const label of y) counts[label] = (counts[label] || 0) + 1;
    let sumSq = 0;
    for (const key of Object.keys(counts)) {
      const p = counts[key] / y.length;
      sumSq += p * p;
    }
    return 1 - sumSq;
  }

  private sampleRandomFeatures(nFeatures: number, count: number): number[] {
    const indices: number[] = [];
    const pool = Array.from({ length: nFeatures }, (_, i) => i);
    const target = Math.min(count, nFeatures);
    for (let i = 0; i < target; i++) {
      const rand = Math.floor(Math.random() * pool.length);
      indices.push(pool[rand]);
      pool.splice(rand, 1);
    }
    return indices;
  }

  private predictTree(x: number[], node: DecisionTreeNode): Record<string, number> {
    if (node.isLeaf || !node.left || !node.right || node.featureIndex === undefined || node.splitValue === undefined) {
      return node.probabilities || {};
    }
    if (x[node.featureIndex] < node.splitValue) {
      return this.predictTree(x, node.left);
    } else {
      return this.predictTree(x, node.right);
    }
  }

  public predictProbabilities(x: number[]): Record<string, number> {
    const avgProbs: Record<string, number> = {};
    for (const cls of this.classes) avgProbs[cls] = 0;
    if (this.trees.length === 0) return avgProbs;

    for (const tree of this.trees) {
      const p = this.predictTree(x, tree);
      for (const cls of this.classes) {
        avgProbs[cls] += (p[cls] || 0) / this.trees.length;
      }
    }
    return avgProbs;
  }

  public predict(x: number[]): { category: string; confidence: number; allProbabilities: Record<string, number> } {
    const probs = this.predictProbabilities(x);
    let bestCls = this.classes[0] || 'Normal';
    let bestProb = 0;

    for (const [cls, prob] of Object.entries(probs)) {
      if (prob > bestProb) {
        bestProb = prob;
        bestCls = cls;
      }
    }

    return {
      category: bestCls,
      confidence: Math.round(bestProb * 1000) / 10,
      allProbabilities: probs,
    };
  }

  public getClasses(): string[] {
    return this.classes;
  }

  public getFeatureImportances(): { feature: string; importance: number }[] {
    return this.featureNames.map((name, i) => ({
      feature: name,
      importance: Math.round((this.featureImportances[i] || 0) * 1000) / 10,
    })).sort((a, b) => b.importance - a.importance);
  }
}
