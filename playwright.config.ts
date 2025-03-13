import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 4 : 4,
	reporter: [
		[
			"./src/report/prometheus-push-gateway-reporter.ts",
			{
				serverUrl: "http://localhost:9191",
				jobName: "playwright-test",
				prefix: "pw_",
				defaultMetrics: true,
				labels: {
					namespace: "frontend-test",
				},
			},
		],
	],
	use: {
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
});
