import { IncomingMessage } from "http";
import { collectDefaultMetrics, Pushgateway, register, RegistryContentType } from "prom-client";
import { Counter, Histogram } from "./metric";

import { CommonLabel, commonLabelAllowedFields, PrometheusOptions } from "./types";

export abstract class Collector {
	constructor(protected readonly commonOptions: PrometheusOptions) {}

	/**
	 * Build metric name with an optional common prefix
	 */
	protected formatMetricName(name: string): string {
		const prefix = this.commonOptions.prefix!.endsWith("_")
			? this.commonOptions.prefix!.slice(0, -1)
			: this.commonOptions.prefix;

		return [prefix, name].join("_");
	}

	abstract push(): Promise<IncomingMessage | undefined>;
	abstract clear(): void;
}

export class HttpCollector extends Collector {
	private readonly client: Pushgateway<RegistryContentType>;
	readonly total_test_run_duration: Histogram<CommonLabel>;
	readonly total_test_duration: Counter<CommonLabel>;
	readonly total_test_count: Counter<CommonLabel>;
	readonly total_test_retry_count: Counter<CommonLabel>;
	readonly total_test_skipped_count: Counter<CommonLabel>;
	readonly total_test_passed_count: Counter<CommonLabel>;
	readonly total_test_failed_count: Counter<CommonLabel>;

	constructor(commonOptions: PrometheusOptions) {
		super(commonOptions);
		this.client = new Pushgateway(commonOptions.serverUrl!);

		this.total_test_run_duration = new Histogram(
			this.formatMetricName("http_request_duration_seconds"),
			commonLabelAllowedFields,
			this.formatMetricName("http_request_duration_seconds"),
			[0.1, 0.5, 1, 5, 10, 15, 30, 60]
		);
		this.total_test_count = new Counter(this.formatMetricName("test_run_duration"), commonLabelAllowedFields);
		this.total_test_duration = new Counter(this.formatMetricName("total_test_duration"), commonLabelAllowedFields);
		this.total_test_retry_count = new Counter(
			this.formatMetricName("total_test_retry_count"),
			commonLabelAllowedFields
		);
		this.total_test_passed_count = new Counter(
			this.formatMetricName("total_test_passed_count"),
			commonLabelAllowedFields
		);
		this.total_test_skipped_count = new Counter(
			this.formatMetricName("total_test_skipped_count"),
			commonLabelAllowedFields
		);
		this.total_test_failed_count = new Counter(
			this.formatMetricName("total_test_failed_count"),
			commonLabelAllowedFields
		);
	}

	clear(): void {
		register.clear();
	}

	registerDefaultMetrics() {
		collectDefaultMetrics({ prefix: this.commonOptions.prefix! });
	}

	async push() {
		if (this.commonOptions) {
			try {
				const { resp } = await this.client.pushAdd({
					jobName: this.commonOptions.jobName ?? "",
					groupings: this.commonOptions.labels,
				});
				return resp as IncomingMessage;
			} catch (error) {
				console.error("playwright-prometheus-reporter failed to push metrics", error);
			}
		}
		return undefined;
	}
}
