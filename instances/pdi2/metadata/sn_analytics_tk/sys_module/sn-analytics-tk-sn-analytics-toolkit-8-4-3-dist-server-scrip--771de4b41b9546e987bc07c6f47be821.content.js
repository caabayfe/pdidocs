import { GlideRecord, gs } from '@servicenow/glide';
import { Columns, dataVizSourceTypes, Tables } from '../constants.js';
import { VisualizationCacheManager } from './visualization-cache-manager.js';
import { VisualizationSummaryGenerator } from './visualization-summary-generator.js';
import { VisualizationUtils } from './visualization-utils.js';
/**
 * Unified processor for visualization configuration extraction and summary generation
 * Combines the functionality of VisualizationConfigurationExtractor and VisualizationSummaryGenerator
 */
export class VisualizationProcessor {
    type = 'VisualizationProcessor';
    _cacheManager;
    _summaryGenerator;
    _firstRun;
    errorCounts = {
        noProperties: 0,
        jsonParseError: 0,
        noDataSources: 0,
        nullDataSource: 0,
        emptyDataSourceType: 0,
        saveError: 0,
    };
    constructor(firstRun = false) {
        this._cacheManager = new VisualizationCacheManager();
        this._summaryGenerator = new VisualizationSummaryGenerator(this._cacheManager);
        this._firstRun = firstRun;
    }
    // ==================== Public Processing Methods ====================
    /**
     * Processes visualizations that don't have configuration metadata
     */
    processVisualizationsWithMissingConfiguration() {
        const visGR = this._findVisualizationsWithoutMetadata();
        this._processVisualizationRecord(visGR);
    }
    /**
     * Processes all visualizations
     */
    processAllVisualizations() {
        const visGR = new GlideRecord(Tables.PAR_VISUALIZATION);
        this._cacheManager.queryNoDomain(visGR);
        this._processVisualizationRecord(visGR);
    }
    /**
     * Processes a specific visualization by sys_id
     */
    processVisualization(visualizationSysId) {
        if (!visualizationSysId) {
            gs.error('[VisualizationProcessor] No visualizationSysId provided');
            return;
        }
        const visGR = new GlideRecord(Tables.PAR_VISUALIZATION);
        visGR.addQuery(Columns.SYS_ID, visualizationSysId);
        this._cacheManager.queryNoDomain(visGR);
        this._processVisualizationRecord(visGR);
    }
    /**
     * Processes a single visualization record
     */
    processVisualizationRecord(visGR) {
        if (!visGR) {
            VisualizationUtils.debugLog('[VisualizationProcessor] No visualization record provided');
            return;
        }
        this._processVisualization(visGR);
    }
    /**
     * Logs error statistics
     */
    logErrorStatistics() {
        let output = '\n=== Error Statistics ===\n';
        let total = 0;
        const errors = [
            { key: 'noProperties', label: 'Empty properties' },
            { key: 'jsonParseError', label: 'JSON parse errors' },
            { key: 'noDataSources', label: 'No data sources' },
            { key: 'nullDataSource', label: 'Null data sources' },
            { key: 'emptyDataSourceType', label: 'Empty data source type' },
            { key: 'saveError', label: 'Save errors' },
        ];
        errors.forEach(({ key, label }) => {
            const count = this.errorCounts[key] || 0;
            output += `${label}: ${count}\n`;
            total += count;
        });
        output += '------------------------\n';
        output += `TOTAL ERRORS: ${total}\n`;
        gs.info(output);
        this._cacheManager.logCacheStatistics();
    }
    // ==================== Summary Generation ====================
    /**
     * Generates a human-like natural language summary for a visualization
     * Delegates to VisualizationSummaryGenerator for modular summary generation
     */
    generateSummary(visualizationInput, cacheKeysObject) {
        return this._summaryGenerator.generate(visualizationInput, cacheKeysObject);
    }
    // ==================== Private Processing Methods ====================
    _processVisualizationRecord(visGR) {
        let processed = 0;
        while (visGR.next()) {
            try {
                VisualizationUtils.debugLog(`[VisualizationProcessor] Processing visualization: ${visGR.getDisplayValue('name')} (${visGR.getUniqueValue()})`);
                this._processVisualization(visGR);
            }
            catch (innerErr) {
                VisualizationUtils.debugLog(`[VisualizationProcessor] Error processing visualization sys_id=${visGR.getUniqueValue()}: ${innerErr}`);
                return;
            }
            processed++;
        }
        gs.info(`[VisualizationProcessor] Processed ${processed} visualization(s).`);
        this.logErrorStatistics();
    }
    _processVisualization(visGR) {
        const visSysId = visGR.getUniqueValue();
        const macroponent = visGR.getValue('macroponent') || '';
        const propertiesStr = visGR.getValue('properties');
        // Parse and validate properties
        const propertiesJson = this._parseAndValidateProperties(propertiesStr, visSysId);
        if (!propertiesJson) {
            return;
        }
        // Validate data sources
        const dataSources = propertiesJson.dataSources || [];
        if (!this._validateDataSources(dataSources, visSysId)) {
            return;
        }
        // Process each data source
        for (let i = 0; i < dataSources.length; i++) {
            const dataSource = dataSources[i];
            if (!dataSource) {
                this.errorCounts.nullDataSource++;
                continue;
            }
            this._processDataSource(visGR, visSysId, macroponent, propertiesJson, dataSource, i);
        }
    }
    /**
     * Parses and validates visualization properties JSON
     */
    _parseAndValidateProperties(propertiesStr, visSysId) {
        if (!propertiesStr) {
            this.errorCounts.noProperties++;
            VisualizationUtils.debugLog(`[VisualizationProcessor] properties field is empty for visualization: ${visSysId}`);
            return null;
        }
        try {
            return JSON.parse(propertiesStr);
        }
        catch (e) {
            this.errorCounts.jsonParseError++;
            VisualizationUtils.debugLog(`[VisualizationProcessor] Failed to parse properties JSON for ${visSysId}: ${e}`);
            return null;
        }
    }
    /**
     * Validates that data sources exist and are valid
     */
    _validateDataSources(dataSources, visSysId) {
        if (!Array.isArray(dataSources) || dataSources.length === 0) {
            this.errorCounts.noDataSources++;
            VisualizationUtils.debugLog(`[VisualizationProcessor] No dataSources found for visualization: ${visSysId}`);
            return false;
        }
        return true;
    }
    /**
     * Processes a single data source within a visualization
     */
    _processDataSource(visGR, visSysId, macroponent, propertiesJson, dataSource, index) {
        const dsType = dataSource.sourceType || '';
        if (!dsType) {
            this.errorCounts.emptyDataSourceType++;
            VisualizationUtils.debugLog(`[VisualizationProcessor] Empty sourceType for dataSource in visualization: ${visSysId}`);
            return;
        }
        const aiFields = {};
        // preserve cache keys like group_by, trend_by values for each data source
        const cacheKeysObject = {};
        let table = '';
        if (dsType === dataVizSourceTypes.TABLE) {
            table = dataSource.tableOrViewName || '';
        }
        else if (dsType === dataVizSourceTypes.INDICATOR) {
            table = Tables.PA_INDICATORS;
        }
        else {
            table = dsType; // unknown data source type
        }
        let groupBySysIds = '';
        if (Array.isArray(propertiesJson.groupBy)) {
            const groupBy = this._extractGroupBy(propertiesJson.groupBy, dataSource.id || '', table);
            groupBySysIds = groupBy.groupByFieldSysIds || '';
            cacheKeysObject['group_by'] = groupBy.groupByFields || '';
        }
        // Extract common fields
        this._extractCommonFields(visGR, visSysId, macroponent, propertiesJson, dataSource, table, aiFields, cacheKeysObject);
        // Extract data source specific fields
        const metric = this._getMetric(propertiesJson.metrics, dataSource.id || '');
        this._extractDataSourceSpecificFields(dsType, dataSource, metric, groupBySysIds, aiFields);
        // Save configuration metadata
        this._saveVisualizationConfiguration(visGR, visSysId, dsType, aiFields, cacheKeysObject, index, dataSource.id);
    }
    /**
     * Extracts common fields shared across all data source types
     */
    _extractCommonFields(visGR, visSysId, macroponent, propertiesJson, ds, table, aiFields, cacheKeysObject) {
        aiFields.par_component = visSysId;
        aiFields.u_chart_type = macroponent;
        aiFields.name =
            propertiesJson.headerTitle ||
                propertiesJson.title ||
                this._cacheManager.getVizDisplayValue(visGR, visSysId);
        aiFields.description = propertiesJson.description || '';
        aiFields.period = VisualizationUtils.getPeriod(propertiesJson.period);
        aiFields.source_type = ds.sourceType || '';
        // Extract trend by fields
        if (propertiesJson.trendBy &&
            Array.isArray(propertiesJson.trendBy.trendByFields)) {
            const trendBy = this._extractTrendBy(propertiesJson.trendBy.trendByFields, propertiesJson.metrics, ds.id || '', table);
            aiFields.trend_by = trendBy.fieldsSysIds;
            cacheKeysObject['trend_by'] = trendBy.fields || '';
        }
        else {
            aiFields.trend_by = '';
        }
        // Extract metric label
        const metric = this._getMetric(propertiesJson.metrics, ds.id || '');
        aiFields.metric_label = metric && metric.label ? metric.label : '';
    }
    /**
     * Extracts fields specific to each data source type (table, indicator, etc.)
     */
    _extractDataSourceSpecificFields(dsType, ds, metric, groupBySysIds, aiFields) {
        if (dsType === dataVizSourceTypes.TABLE) {
            this._extractTableFields(ds, metric, groupBySysIds, aiFields);
        }
        else if (dsType === dataVizSourceTypes.INDICATOR) {
            this._extractIndicatorFields(ds, metric, groupBySysIds, aiFields);
        }
        else {
            // Handle other source types
            if (ds.label) {
                aiFields.metric_label = ds.label;
            }
            aiFields.group_by = groupBySysIds;
            aiFields.filter = ds.filterQuery || '';
            aiFields.aggregation = (metric && metric.aggregateFunction) || '';
        }
    }
    /**
     * Extracts fields specific to table data sources
     */
    _extractTableFields(ds, metric, groupBySysIds, aiFields) {
        aiFields.source_table = Tables.SYS_DB_OBJECT;
        aiFields.source = this._cacheManager.getDataSourceSysId(ds.tableOrViewName || '');
        aiFields.filter = ds.filterQuery || '';
        aiFields.group_by = groupBySysIds;
        aiFields.aggregation = (metric && metric.aggregateFunction) || '';
        aiFields.u_indicator_filters = '';
        aiFields.dimensions = '';
        aiFields.aggregation_field =
            metric?.aggregateField && ds.tableOrViewName
                ? this._cacheManager.getField(metric.aggregateField, ds.tableOrViewName)
                    .displayValue || ''
                : '';
    }
    /**
     * Extracts fields specific to indicator data sources
     */
    _extractIndicatorFields(ds, metric, groupBySysIds, aiFields) {
        if (metric && metric.aggregateIndicator) {
            const aggregation = this._cacheManager.getIndicatorAggregation(metric.aggregateIndicator);
            aiFields.aggregation = aggregation.function;
            aiFields.aggregation_field = aggregation.name;
        }
        aiFields.source_table = Tables.PA_INDICATORS;
        aiFields.source = ds.uuid && ds.uuid.indicator ? ds.uuid.indicator : '';
        aiFields.dimensions = groupBySysIds;
        aiFields.filter = '';
        aiFields.u_indicator_filters = VisualizationUtils.extractBreakdowns((ds.uuid && ds.uuid.breakdowns) || []);
        aiFields.group_by = '';
    }
    _saveVisualizationConfiguration(visGR, visSysId, dsType, aiFields, cacheKeysObject, index, dataSourceId) {
        const metaGR = new GlideRecord(Tables.PAR_VISUALIZATION_CONFIGURATION);
        if (!this._firstRun) {
            metaGR.addQuery(Columns.PAR_COMPONENT, visSysId);
            metaGR.addQuery(Columns.SOURCE_TABLE, aiFields.source_table);
            metaGR.addQuery(Columns.SOURCE, aiFields.source);
            this._cacheManager.queryNoDomain(metaGR);
        }
        let isUpdate = false;
        if (!this._firstRun && metaGR.next()) {
            isUpdate = true;
            VisualizationUtils.debugLog(`[VisualizationProcessor] Updating par_visualization_configuration for visualization: ${visSysId} Type: ${metaGR.getValue(Columns.SOURCE_TABLE)} source: ${metaGR.getValue(Columns.SOURCE) || ''}`);
        }
        else {
            if (this._firstRun) {
                metaGR.initialize();
            }
            VisualizationUtils.debugLog(`[VisualizationProcessor] Inserting new par_visualization_configuration for visualization: ${visSysId} Type: ${aiFields.source_table} source: ${aiFields.source || ''}`);
        }
        // Set fields
        Object.entries(aiFields).forEach(([key, value]) => {
            if (value !== undefined) {
                metaGR.setValue(key, value);
            }
        });
        // Generate summary
        const chartMCPSysId = visGR.getValue('macroponent');
        const chartType = this._cacheManager.getChartTypeDisplayValue(visGR, chartMCPSysId);
        const { summary, metaData } = this.generateSummary({
            ...aiFields,
            u_chart_type: chartType,
        }, cacheKeysObject);
        metaGR.setValue('summary', summary);
        metaGR.setValue('metadata', JSON.stringify(metaData));
        try {
            if (isUpdate) {
                metaGR.update();
            }
            else {
                metaGR.setWorkflow(false);
                metaGR.insert();
            }
            VisualizationUtils.debugLog(`[VisualizationProcessor] par_visualization_configuration record saved for visualization: ${visSysId} dataSource: ${dataSourceId || `${dsType}_${index}`}`);
        }
        catch (metaErr) {
            this.errorCounts.saveError++;
            VisualizationUtils.debugLog(`[VisualizationProcessor] Error saving par_visualization_configuration for visualization: ${visSysId} dataSource: ${dataSourceId || `${dsType}_${index}`} isUpdate:${isUpdate} - ${metaErr}`);
        }
    }
    // ==================== Private Helper Methods ====================
    _findVisualizationsWithoutMetadata() {
        const metaGR = new GlideRecord(Tables.PAR_VISUALIZATION_CONFIGURATION);
        metaGR.orderByDesc(Columns.UPDATED_ON);
        metaGR.setLimit(1);
        this._cacheManager.queryNoDomain(metaGR);
        let latestMetaUpdated = '';
        if (metaGR.next()) {
            latestMetaUpdated = metaGR.getValue(Columns.UPDATED_ON);
        }
        const visGR = new GlideRecord(Tables.PAR_VISUALIZATION);
        visGR.addEncodedQuery(`sys_updated_on>${latestMetaUpdated}`);
        this._cacheManager.queryNoDomain(visGR);
        return visGR;
    }
    _getMetric(metrics, id) {
        if (!Array.isArray(metrics)) {
            return null;
        }
        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            if (metric && metric.dataSource === id) {
                return metric;
            }
        }
        return null;
    }
    _extractGroupBy(groupBy, dataSourceId, dataSource) {
        if (!Array.isArray(groupBy)) {
            return { groupByFieldSysIds: '', groupByFields: '' };
        }
        const groupByFields = [];
        const groupByFieldSysIds = [];
        for (let i = 0; i < groupBy.length; i++) {
            const groupByField = groupBy[i];
            if (groupByField && Array.isArray(groupByField.groupBy)) {
                const group = groupByField.groupBy[0];
                if (group && group.dataSource === dataSourceId) {
                    const sysId = this._cacheManager.getFieldSysId(dataSource, group.groupByField);
                    groupByFields.push(group.groupByField);
                    groupByFieldSysIds.push(sysId);
                }
            }
        }
        return {
            groupByFieldSysIds: groupByFieldSysIds.join(','),
            groupByFields: groupByFields.join(','),
        };
    }
    _extractTrendBy(trendBy, metrics, dataSourceId, dataSource) {
        if (!Array.isArray(trendBy) || !Array.isArray(metrics)) {
            return { fields: '', fieldsSysIds: '' };
        }
        const fields = [];
        const fieldsSysIds = [];
        for (let i = 0; i < trendBy.length; i++) {
            for (let j = 0; j < metrics.length; j++) {
                const trend = trendBy[i];
                const metric = metrics[j];
                if (trend &&
                    metric &&
                    metric.dataSource === dataSourceId &&
                    metric.id === trend.metric &&
                    trend.field) {
                    const sysId = this._cacheManager.getFieldSysId(dataSource, trend.field);
                    fields.push(trend.field);
                    fieldsSysIds.push(sysId);
                }
            }
        }
        return {
            fields: fields.join(','),
            fieldsSysIds: fieldsSysIds.join(','),
        };
    }
}
