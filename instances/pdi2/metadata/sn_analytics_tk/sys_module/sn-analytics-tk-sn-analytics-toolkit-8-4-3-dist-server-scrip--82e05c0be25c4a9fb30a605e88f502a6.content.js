import { dataVizSourceTypes, Tables } from '../constants.js';
/**
 * Generates human-readable natural language summaries for visualizations
 * Handles different source types (table, indicator, generic) with specialized builders
 */
export class VisualizationSummaryGenerator {
    _cacheManager;
    constructor(cacheManager) {
        this._cacheManager = cacheManager;
    }
    /**
     * Main entry point for generating visualization summaries
     */
    generate(visualizationInput, cacheKeysObject) {
        const cache = this._cacheManager.getInputCache();
        const fields = this._extractFields(visualizationInput);
        const { summaryParts, metaData } = this._buildSummaryParts(fields, cacheKeysObject);
        const finalSummary = this._formatFinalSummary(summaryParts);
        // Update cache manager with any new cached values
        this._cacheManager.updateFromInputCache(cache);
        return { summary: finalSummary, metaData };
    }
    /**
     * Extracts and normalizes all relevant fields from visualization input
     */
    _extractFields(visualizationInput) {
        return {
            name: visualizationInput.name || '',
            chartType: visualizationInput['u_chart_type'] || '',
            description: visualizationInput.description || '',
            period: visualizationInput.period || '',
            trendBy: visualizationInput['trend_by'] || '',
            metricLabel: visualizationInput['metric_label'] || '',
            sourceTable: visualizationInput['source_table'] || '',
            source: visualizationInput.source || '',
            filter: visualizationInput.filter || '',
            groupBy: visualizationInput['group_by'] || '',
            indicatorFilters: visualizationInput['u_indicator_filters'] || '',
            dimensions: visualizationInput['dimensions'] || '',
            sourceType: visualizationInput['source_type'] || '',
            aggregation: visualizationInput['aggregation'] || '',
            aggregationField: visualizationInput['aggregation_field'] || '',
        };
    }
    /**
     * Builds summary parts and metadata based on source type
     */
    _buildSummaryParts(fields, cacheKeysObject) {
        const summaryParts = [];
        const metaData = {};
        // Add common parts (title, chart type, description)
        this._addCommonParts(fields, summaryParts, metaData);
        // Add source-specific parts
        if (fields.sourceType === dataVizSourceTypes.TABLE) {
            this._buildTableSummary(fields, cacheKeysObject, summaryParts, metaData);
        }
        else if (fields.sourceType === dataVizSourceTypes.INDICATOR) {
            this._buildIndicatorSummary(fields, summaryParts, metaData);
        }
        else if (fields.sourceType) {
            this._buildGenericSummary(fields, summaryParts, metaData);
        }
        return { summaryParts, metaData };
    }
    /**
     * Adds common summary parts (name, chart type, description)
     */
    _addCommonParts(fields, summaryParts, metaData) {
        // Title
        if (fields.name) {
            summaryParts.push(fields.name);
        }
        // Chart type
        if (fields.chartType) {
            summaryParts.push(` ${fields.chartType.toLowerCase()} chart`);
            metaData['chart'] = fields.chartType.toLowerCase();
        }
        // Description
        if (fields.description) {
            summaryParts.push(fields.description);
        }
    }
    /**
     * Builds summary for table-based visualizations
     */
    _buildTableSummary(fields, cacheKeysObject, summaryParts, metaData) {
        const table = this._cacheManager.getTable(fields.source, fields.sourceTable);
        summaryParts.push(` on ${table?.displayValue || ''}`);
        metaData['table'] = table?.displayValue || '';
        if (fields.metricLabel) {
            summaryParts.push(` on ${fields.metricLabel}`);
            metaData['metricLabel'] = fields.metricLabel;
        }
        if (fields.aggregationField) {
            summaryParts.push(` aggregated by ${fields.aggregationField}`);
            metaData['aggregationField'] = fields.aggregationField;
        }
        if (fields.aggregation) {
            summaryParts.push(` over ${fields.aggregation}`);
            metaData['aggregation'] = fields.aggregation;
        }
        if (fields.groupBy && table) {
            const { value, message } = this._cacheManager.formatFieldList(cacheKeysObject.group_by || '', table.name);
            summaryParts.push(` grouped by: ${message}`);
            metaData['groupBy'] = value.join(', ');
        }
        if (fields.trendBy && table) {
            const { value, message } = this._cacheManager.formatFieldList(cacheKeysObject.trend_by || '', table.name);
            summaryParts.push(` trends by: ${message}`);
            metaData['trendBy'] = value.join(', ');
        }
        if (fields.period) {
            summaryParts.push(` over a period of: ${fields.period.toLowerCase()}`);
            metaData['period'] = fields.period.toLowerCase();
        }
        if (fields.filter) {
            summaryParts.push(` filter: ${fields.filter}`);
            metaData['filter'] = fields.filter;
        }
    }
    /**
     * Builds summary for indicator-based visualizations
     */
    _buildIndicatorSummary(fields, summaryParts, metaData) {
        const indicator = this._cacheManager.getTable(fields.source, fields.sourceTable)
            .displayValue || 'unknown';
        summaryParts.push(` indicator: ${indicator}`);
        metaData['indicator'] = indicator;
        if (fields.metricLabel) {
            summaryParts.push(` on ${fields.metricLabel}`);
            metaData['metricLabel'] = fields.metricLabel;
        }
        if (fields.aggregationField) {
            summaryParts.push(` aggregated by ${fields.aggregationField}`);
            metaData['aggregationField'] = fields.aggregationField;
        }
        if (fields.aggregation) {
            summaryParts.push(` over ${fields.aggregation}`);
            metaData['aggregation'] = fields.aggregation;
        }
        if (fields.dimensions) {
            const { value, message } = this._cacheManager.formatFieldList(fields.dimensions, Tables.PA_BREAKDOWNS);
            summaryParts.push(` by ${message}`);
            metaData['dimensions'] = value.join(', ');
        }
        if (fields.indicatorFilters) {
            const { value, message } = this._cacheManager.formatFieldList(fields.indicatorFilters, Tables.PA_BREAKDOWNS);
            summaryParts.push(` filters ${message}`);
            metaData['indicatorFilters'] = value.join(', ');
        }
    }
    /**
     * Builds summary for generic/other source types
     */
    _buildGenericSummary(fields, summaryParts, metaData) {
        if (fields.metricLabel) {
            summaryParts.push(` on ${fields.metricLabel}`);
            metaData['metricLabel'] = fields.metricLabel;
        }
        if (fields.groupBy) {
            summaryParts.push(` grouped by: ${fields.groupBy}`);
            metaData['groupBy'] = fields.groupBy;
        }
        if (fields.aggregation) {
            summaryParts.push(` over ${fields.aggregation}`);
            metaData['aggregation'] = fields.aggregation;
        }
    }
    /**
     * Formats and cleans up the final summary string
     */
    _formatFinalSummary(summaryParts) {
        let finalSummary = summaryParts
            .join(', ')
            .replace(/,\s*,/g, ', ')
            .replace(/,\s*\.$/, '.')
            .trim();
        if (!finalSummary.endsWith('.')) {
            finalSummary += '.';
        }
        // Capitalize first letter
        finalSummary = finalSummary.charAt(0).toUpperCase() + finalSummary.slice(1);
        return finalSummary;
    }
}
