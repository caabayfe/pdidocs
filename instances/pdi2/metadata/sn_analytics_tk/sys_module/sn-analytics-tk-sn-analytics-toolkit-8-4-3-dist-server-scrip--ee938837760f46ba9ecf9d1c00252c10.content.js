import { GlideRecord, gs } from '@servicenow/glide';
import { ReportDomainUtil, } from '@servicenow/glide/sn_analytics_tk';
import { Tables } from '../constants.js';
import { LRUCache } from '../utils/lru-cache.js';
import { VisualizationUtils } from './visualization-utils.js';
/**
 * Centralized cache manager for visualization processing
 * Handles all caching operations and database lookups
 */
export class VisualizationCacheManager {
    // Field caches
    _fieldCache;
    // Table and record caches
    _tableCache;
    _recordDisplayValueCache;
    // Visualization-specific caches
    _chartTypeDisplayValueCache;
    _vizRecordDisplayValueCache;
    // PA aggregates cache
    _paAggregateCache;
    constructor() {
        // Initialize all caches with LRU behavior
        this._fieldCache = new LRUCache(5000);
        this._tableCache = new LRUCache(2000);
        this._recordDisplayValueCache = new LRUCache(2000);
        this._chartTypeDisplayValueCache = new LRUCache(500);
        this._vizRecordDisplayValueCache = new LRUCache(1000);
        this._paAggregateCache = new LRUCache(500);
    }
    /**
     * Returns an InputCache object for use with summary generation
     */
    getInputCache() {
        return {
            recordDisplayValueCache: this._recordDisplayValueCache,
            fieldCache: this._fieldCache,
        };
    }
    /**
     * Updates caches from an InputCache object
     */
    updateFromInputCache(cache) {
        if (cache.recordDisplayValueCache) {
            for (const [key, value] of Object.entries(cache.recordDisplayValueCache)) {
                this._recordDisplayValueCache.set(key, value);
            }
        }
        if (cache.fieldCache) {
            for (const [key, value] of Object.entries(cache.fieldCache)) {
                this._fieldCache.set(key, value);
            }
        }
    }
    /**
     * Logs cache statistics
     */
    logCacheStatistics() {
        gs.info(`=== Field Cache (${this._fieldCache.size} items) ===`);
        gs.info(`=== Table Cache (${this._tableCache.size} items) ===`);
        gs.info(`=== Record Display Value Cache (${this._recordDisplayValueCache.size} items) ===`);
        gs.info(`=== Chart Type Display Value Cache (${this._chartTypeDisplayValueCache.size} items) ===`);
        gs.info(`=== Visualization Record Display Value Cache (${this._vizRecordDisplayValueCache.size} items) ===`);
    }
    /**
     * Queries GlideRecord without domain restrictions
     */
    queryNoDomain(gr) {
        const reportDomainUtil = ReportDomainUtil && new ReportDomainUtil();
        if (!reportDomainUtil) {
            VisualizationUtils.debugLog('[VisualizationCacheManager] ReportDomainUtil not found. Using GlideRecord query.');
            gr.query();
            return;
        }
        reportDomainUtil.queryNoDomain(gr);
    }
    /**
     * Gets field metadata from extended tables using GlideRecord workaround
     * This is a workaround to support fields from extended tables.
     * Ideally GlideTableDescriptor should be used but it's not allowed to be accessed from scoped apps.
     */
    _getFieldMetadata(field, source, result) {
        try {
            const gr = new GlideRecord(source);
            if (gr.isValid()) {
                gr.setLimit(1);
                this.queryNoDomain(gr);
                if (gr.next()) {
                    const fieldElement = gr.getElement(field);
                    if (fieldElement && fieldElement.getLabel) {
                        result.displayValue = fieldElement.getLabel() || field;
                        result.sysId = this.getFieldSysIdFromSysDictionary(fieldElement.getED().getTableName(), field);
                    }
                }
            }
        }
        catch (e) {
            VisualizationUtils.debugLog(`[VisualizationCacheManager] Error getting field metadata: ${JSON.stringify(e)}`);
        }
    }
    /**
     * Gets field sys_id from sys_dictionary table
     */
    getFieldSysIdFromSysDictionary(table, field) {
        const gr = new GlideRecord(Tables.SYS_DICTIONARY);
        if (gr.isValid()) {
            gr.addQuery('name', table);
            gr.addQuery('element', field);
            this.queryNoDomain(gr);
            if (gr.next()) {
                return gr.getUniqueValue();
            }
        }
        return '';
    }
    /**
     * Gets field metadata (display value and sys_id) with caching
     */
    getField(field, source) {
        const cacheKey = VisualizationUtils.getFieldCacheKey(source, field);
        const cached = this._fieldCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = {
            displayValue: field,
            sysId: '',
        };
        if (source === Tables.PA_BREAKDOWNS) {
            const breakdownGR = new GlideRecord(Tables.PA_BREAKDOWNS);
            const isValid = Boolean(breakdownGR.get(field));
            if (isValid) {
                result.displayValue = breakdownGR.getDisplayValue();
                result.sysId = breakdownGR.getUniqueValue();
            }
        }
        else {
            this._getFieldMetadata(field, source, result);
        }
        this._fieldCache.set(cacheKey, result);
        return result;
    }
    /**
     * Gets field sys_id with caching
     */
    getFieldSysId(table, field) {
        const cacheKey = VisualizationUtils.getFieldCacheKey(table, field);
        if (this._fieldCache.has(cacheKey)) {
            return this._fieldCache.get(cacheKey)?.sysId || field;
        }
        const fieldMetadata = this.getField(field, table);
        return fieldMetadata.sysId || field;
    }
    /**
     * Gets table/record information with caching
     */
    getTable(sysId, tableName) {
        const cacheKey = VisualizationUtils.getTableCacheKey(tableName, sysId);
        const cachedValue = this._recordDisplayValueCache.get(cacheKey);
        if (cachedValue) {
            return cachedValue;
        }
        const gr = new GlideRecord(tableName);
        let displayValue = tableName;
        let name = sysId;
        const exists = Boolean(gr.get(sysId));
        if (gr.isValid() && exists) {
            displayValue = gr.getDisplayValue();
            name = gr.getValue('name') || sysId;
        }
        const tableConf = {
            displayValue,
            name,
        };
        if (gr.isValid()) {
            this._recordDisplayValueCache.set(cacheKey, tableConf);
        }
        return tableConf;
    }
    /**
     * Gets data source (table) sys_id with caching
     */
    getDataSourceSysId(table) {
        const cachedValue = this._tableCache.get(table);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        const ds = new GlideRecord(Tables.SYS_DB_OBJECT);
        ds.addQuery('name', table);
        this.queryNoDomain(ds);
        if (ds.next()) {
            const sysId = ds.getUniqueValue();
            this._tableCache.set(table, sysId);
            return sysId;
        }
        return '';
    }
    /**
     * Gets visualization display value with caching
     */
    getVizDisplayValue(visGR, visSysId) {
        let displayValue = this._vizRecordDisplayValueCache.get(visSysId);
        if (displayValue === undefined) {
            displayValue = visGR.getDisplayValue() || '';
            this._vizRecordDisplayValueCache.set(visSysId, displayValue);
        }
        return displayValue || '';
    }
    /**
     * Gets chart type display value with caching
     */
    getChartTypeDisplayValue(visGR, chartMCPSysId) {
        let chartType = this._chartTypeDisplayValueCache.get(chartMCPSysId);
        if (chartType === undefined) {
            chartType = visGR.getDisplayValue('macroponent') || '';
            this._chartTypeDisplayValueCache.set(chartMCPSysId, chartType);
        }
        return chartType;
    }
    /**
     * Gets PA indicator aggregation details with caching
     */
    getIndicatorAggregation(paAggregate) {
        if (this._paAggregateCache.has(paAggregate)) {
            return (this._paAggregateCache.get(paAggregate) || { name: '', function: '' });
        }
        const aggregateGR = new GlideRecord('pa_aggregates');
        aggregateGR.addQuery('sys_id', paAggregate);
        this.queryNoDomain(aggregateGR);
        if (aggregateGR.next()) {
            const aggregation = {
                name: aggregateGR.getValue('name'),
                function: aggregateGR.getDisplayValue('func'),
            };
            this._paAggregateCache.set(paAggregate, aggregation);
            return aggregation;
        }
        return { name: '', function: '' };
    }
    /**
     * Resolves a list of fields to their display values with caching
     */
    formatFieldList(fieldList, tableName) {
        if (!fieldList || !tableName) {
            return {
                value: [],
                message: Array.isArray(fieldList) ? '' : fieldList || '',
            };
        }
        // Normalize input to array
        let ids = [];
        if (typeof fieldList === 'string') {
            ids = fieldList
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
        }
        else if (Array.isArray(fieldList)) {
            ids = fieldList;
        }
        if (ids.length === 0) {
            return { value: [], message: '' };
        }
        const displayValues = ids.map(field => {
            const fieldCacheKey = VisualizationUtils.getFieldCacheKey(tableName, field);
            const cachedField = this._fieldCache.get(fieldCacheKey);
            if (VisualizationUtils.isServiceNowSysId(field) && cachedField) {
                return cachedField.displayValue;
            }
            const fieldMetadata = this.getField(field, tableName);
            return fieldMetadata.displayValue;
        });
        return {
            value: displayValues,
            message: VisualizationUtils.formatNaturalLanguageList(displayValues),
        };
    }
}
