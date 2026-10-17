class VisualizationConfigurationExtractor {
	constructor(_firstRun) {
		this.firstRun = _firstRun;
	}
	processVisualization(visualizationSysId) {
		const {
			VisualizationProcessor,
		} = require('./dist/server/script-include-scripts/visualization-processor.js');

		return new VisualizationProcessor().processVisualization(
			visualizationSysId
		);
	}
	processVisualizationsWithMissingConfiguration() {
		const {
			VisualizationProcessor,
		} = require('./dist/server/script-include-scripts/visualization-processor.js');

		return new VisualizationProcessor().processVisualizationsWithMissingConfiguration();
	}
	processAllVisualizations() {
		const {
			VisualizationProcessor,
		} = require('./dist/server/script-include-scripts/visualization-processor.js');

		return new VisualizationProcessor(this.firstRun).processAllVisualizations();
	}
	processVisualizationRecord(visGR) {
		const {
			VisualizationProcessor,
		} = require('./dist/server/script-include-scripts/visualization-processor.js');

		return new VisualizationProcessor().processVisualizationRecord(
			visGR
		);
	}
}
