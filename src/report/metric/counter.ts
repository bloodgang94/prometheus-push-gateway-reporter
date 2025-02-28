import { Counter as PromCounter, register } from "prom-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Counter<M extends Record<string, any>> {
	private readonly promCounter: PromCounter;

	constructor(name: string, labelNames: Extract<keyof M, string>[] = [], help?: string) {
		const existedMetric = register.getSingleMetric(name);
		if (existedMetric && existedMetric instanceof PromCounter) {
			this.promCounter = existedMetric;
			return;
		}

		this.promCounter = new PromCounter({
			name,
			labelNames,
			help: help ?? name,
		});
	}

	validateLabels(rawLabels: Partial<M>): Partial<M> {
		return rawLabels;
	}

	increment(rawLabels: Partial<M>, value?: number): void {
		const labels = this.validateLabels(rawLabels);

		this.promCounter.inc(labels, value);
	}
}
