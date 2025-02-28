# prometheus-push-gateway-reporter

## Usage

playwright.config.ts:

```ts
reporter: [
		[...],
		[
			"@rowi-test/prometheus-push-gateway-reporter",
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
