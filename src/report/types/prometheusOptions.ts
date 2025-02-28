export type PrometheusOptions = {
	/**
	 * URL of the Prometheus remote write implementation's endpoint.
	 * @default 'http://127.0.0.1:9091' */
	serverUrl?: string;
	jobName?: string;
	/** @default 'pw_' */
	prefix?: string;
	/**
	 * Additional labels to apply to each timeseries.
	 * @example
	 * { instance: "hostname" }
	 */
	labels?: Record<string, string>;
	/**
	 * Additional labels to apply to each timeseries.
	 * @example
	 * { instance: "hostname" }
	 */
	defaultMetrics?: boolean;
};
