import { Gauge as PromGauge, register } from "prom-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Gauge<M extends Record<string, any>> {
	private readonly promGauge: PromGauge;

	constructor(name: string, labelNames: Extract<keyof M, string>[] = [], help?: string) {
		const existedMetric = register.getSingleMetric(name);
		if (existedMetric && existedMetric instanceof PromGauge) {
			this.promGauge = existedMetric;
			return;
		}

		this.promGauge = new PromGauge({
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
		this.promGauge.inc(labels, value);
	}

	decrement(rawLabels: Partial<M>, value?: number): void {
		const labels = this.validateLabels(rawLabels);
		this.promGauge.dec(labels, value);
	}
}
