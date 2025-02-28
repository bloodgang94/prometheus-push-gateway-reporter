import { MetricObjectWithValues, MetricValueWithName, Histogram as PromHistogram, register } from "prom-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Histogram<M extends Record<string, any>> {
	private readonly promHistogram: PromHistogram;

	constructor(name: string, labelNames: Extract<keyof M, string>[] = [], help?: string, buckets?: number[]) {
		const existedMetric = register.getSingleMetric(name);
		if (existedMetric && existedMetric instanceof PromHistogram) {
			this.promHistogram = existedMetric;
			return;
		}

		this.promHistogram = new PromHistogram({
			name,
			labelNames,
			buckets: buckets,
			help: help ?? name,
		});
	}

	validateLabels(rawLabels: Partial<M>): Partial<M> {
		return rawLabels;
	}

	observe(rawLabels: Partial<M>, value: number): void {
		const labels = this.validateLabels(rawLabels);

		this.promHistogram.observe(labels, value);
	}

	observeSeconds(rawLabels: Partial<M>, ts: bigint): void {
		const labels = this.validateLabels(rawLabels);
		const secondsFromNanoseconds = ts / BigInt(Math.pow(10, 9));

		this.promHistogram.observe(labels, Number(secondsFromNanoseconds));
	}

	recordTimer(rawLabels: Partial<M>): (labels?: Partial<M>) => number {
		const labels = this.validateLabels(rawLabels);

		return this.promHistogram.startTimer(labels);
	}
	get(): Promise<MetricObjectWithValues<MetricValueWithName<string>>> {
		return this.promHistogram.get();
	}
}
