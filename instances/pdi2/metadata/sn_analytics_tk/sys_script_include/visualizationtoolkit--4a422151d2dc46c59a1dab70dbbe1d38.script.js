class VisualizationToolkit {
	convertVisualizationConfigToVisualizationProps(
		metricConfig,
		additionalProps
	) {
		const {
			convertVisualizationConfigToVisualizationProps,
		} = require('./dist/server/script-include-scripts/convert-config-to-props-internal.js');

		return convertVisualizationConfigToVisualizationProps(
			metricConfig,
			additionalProps
		);
	}

	convertDataConfigurationsToVisualizationPropsInternal(
		metricConfig,
		additionalProps
	) {
		const {
			convertDataConfigurationsToVisualizationPropsInternal,
		} = require('./dist/server/script-include-scripts/convert-data-config-to-metric-internal.js');

		return convertDataConfigurationsToVisualizationPropsInternal(
			metricConfig,
			additionalProps
		);
	}
}
