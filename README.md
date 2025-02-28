# prometheus-push-gateway-reporter

## Usage

playwright.config.ts:

```ts
reporter: [
		[...],
		[
			"./src/playwright/report/prometheus-push-gateway.ts",
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
```
