/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
	TestCase,
	TestResult,
	TestStep,
} from "@playwright/test/reporter";
import * as path from "path";
import { PrometheusOptions } from "./report/types";
import { HttpCollector } from "./report/httpCollector";

class PushGatewayPrometheusReporter implements Reporter {
	constructor(
		private readonly options: PrometheusOptions = { prefix: "_pw", serverUrl: "http://127.0.0.1:9091" },
		private readonly client: HttpCollector = new HttpCollector(options)
	) {}

	private updateResults(result: TestResult, test: TestCase) {
		const labels = {
			outcome: result.status,
			duration: result.duration,
			suite: test.parent.title,
			project: test.parent.project()?.name,
			location: this.location(test),
			attempt: result.retry,
			title: test.title,
			tags: test.tags.join(","),
		};
		if (result.status === "passed") {
			this.client.total_test_passed_count.increment(labels);
		}
		if (result.status === "failed") {
			this.client.total_test_failed_count.increment(labels);
		}
		if (result.status === "skipped") {
			this.client.total_test_skipped_count.increment(labels);
		}
		this.client.total_test_count.increment(labels);
		this.client.total_test_duration.increment(labels, result.duration);
	}

	private location(test: TestCase) {
		const relativePath = path.relative(process.cwd(), test.location.file);
		return `${relativePath}:${test.location.line}`;
	}

	onBegin(config: FullConfig, _suite: Suite) {
		if (this.options.defaultMetrics) this.client.registerDefaultMetrics();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onTestBegin(test: TestCase, result: TestResult) {}

	onTestEnd(test: TestCase, result: TestResult) {
		const seconds = result.duration / 1000;
		this.client.total_test_run_duration.observe(
			{
				outcome: result.status,
				duration: result.duration,
				suite: test.parent.title,
				project: test.parent.project()?.name,
				location: this.location(test),
				attempt: result.retry,
				title: test.title,
				tags: test.tags.join(","),
			},
			seconds
		);

		this.updateResults(result, test);
	}

	async onEnd(result: FullResult) {
		try {
			const resp = await this.client.push();
			const { statusCode = 0 } = resp ?? {};
			if (statusCode >= 200 && statusCode < 300) {
				console.log(`playwright-prometheus-reporter pushed metrics (${statusCode}).`);
			} else {
				console.error(`playwright-prometheus-reporter failed to push metrics (${statusCode}).`);
			}
		} catch (error) {
			console.error("playwright-prometheus-reporter failed to push metrics", error);
		} finally {
			this.client.clear();
		}
	}
}

export default PushGatewayPrometheusReporter;
