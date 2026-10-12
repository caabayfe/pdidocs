/**
 * @class EFAggregationTypeRegistry
 * @classdesc Central registry for all aggregation type configurations in the Error Framework.
 * This registry eliminates conditional logic by providing a data-driven approach to aggregation types.
 * Each configuration defines tables, field constants, and behavioral rules for different aggregation combinations.
 */
class EFAggregationTypeRegistry {
	
	/**
	 * Constants for entity types
	 */
	static ENTITY_TYPE = {
		CODE: 'code',
		CATEGORY: 'category'
	};
	
	/**
	 * Constants for stats types
	 */
	static STATS_TYPE = {
		ALL: 'all',
		SOURCE: 'source',
		INSTANCE: 'instance',
		TIMESERIES: 'timeseries'
	};
	
	/**
	 * Registry of all aggregation type configurations
	 * Each configuration defines:
	 * - table: Function returning the stats table name
	 * - fields: Function returning field constants object from EFConstants
	 * - requiredFields: Database field names that must be present in data for this aggregation type
	 * - queryFields: Database field names used in queries to find existing records
	 * - updateFields: Database field names that get updated on every aggregation run
	 * - initFields: Database field names only set on record creation (not updated on subsequent runs)
	 * 
	 * Key format: 'entityType.statsType'
	 * - entityType: 'code' or 'category'
	 * - statsType: 'all', 'source', 'instance', or 'timeseries'
	 */
	static CONFIGURATIONS = {
		'code.all': {
			table: () => EFConstants.TABLES.ERROR_CODE_STATS,
			fields: () => EFConstants.ERROR_CODE_STATS_FIELDS,
			requiredFields: ['error_code', 'error_category', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION, 'error_code', 'sys_domain'],
			updateFields: ['error_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION, 'error_code', 'error_category']
		},
		'code.source': {
			table: () => EFConstants.TABLES.ERROR_CODE_SOURCE_STATS,
			fields: () => EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS,
			requiredFields: ['error_code', 'error_category', 'error_source', 'error_source_table', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, 'error_code', 'error_source', 'sys_domain'],
			updateFields: ['error_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, 'error_code', 'error_category', 'error_source', 'error_source_table']
		},
		'code.instance': {
			table: () => EFConstants.TABLES.ERROR_CODE_INSTANCE_STATS,
			fields: () => EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS,
			requiredFields: ['error_code', 'error_category', 'error_instance', 'error_instance_table', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.APPLICATION, 'error_code', 'error_source', 'error_instance', 'error_source_table', 'sys_domain'],
			updateFields: ['error_count'],
			initFields: [EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.APPLICATION, 'error_code', 'error_category', 'error_source', 'error_source_table', 'error_instance', 'error_instance_table']
		},
		'code.timeseries': {
			table: () => EFConstants.TABLES.ERROR_CODE_TIMESERIES_STATS,
			fields: () => EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS,
			requiredFields: ['error_code', 'occurred_on', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION, 'error_code', 'occurred_on', 'sys_domain'],
			updateFields: ['error_count', 'error_task_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION, 'error_code', 'occurred_on']
		},
		'category.all': {
			table: () => EFConstants.TABLES.ERROR_CATEGORY_STATS,
			fields: () => EFConstants.ERROR_CATEGORY_STATS_FIELDS,
			requiredFields: ['error_category', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CATEGORY_STATS_FIELDS.APPLICATION, 'error_category', 'sys_domain'],
			updateFields: ['error_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CATEGORY_STATS_FIELDS.APPLICATION, 'error_category']
		},
		'category.source': {
			table: () => EFConstants.TABLES.ERROR_CATEGORY_SOURCE_STATS,
			fields: () => EFConstants.ERROR_CATEGORY_SOURCE_STATS_FIELDS,
			requiredFields: ['error_category', 'error_source', 'error_source_table', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CATEGORY_SOURCE_STATS_FIELDS.APPLICATION, 'error_category', 'error_source', 'sys_domain'],
			updateFields: ['error_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CATEGORY_SOURCE_STATS_FIELDS.APPLICATION, 'error_category', 'error_source', 'error_source_table']
		},
		'category.instance': {
			table: () => EFConstants.TABLES.ERROR_CATEGORY_INSTANCE_STATS,
			fields: () => EFConstants.ERROR_CATEGORY_INSTANCE_STATS_FIELDS,
			requiredFields: ['error_category', 'error_instance', 'error_instance_table', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CATEGORY_INSTANCE_STATS_FIELDS.APPLICATION, 'error_category', 'error_source', 'error_instance', 'error_source_table', 'sys_domain'],
			updateFields: ['error_count'],
			initFields: [EFConstants.ERROR_CATEGORY_INSTANCE_STATS_FIELDS.APPLICATION, 'error_category', 'error_source', 'error_source_table', 'error_instance', 'error_instance_table']
		},
		'category.timeseries': {
			table: () => EFConstants.TABLES.ERROR_CATEGORY_TIMESERIES_STATS,
			fields: () => EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS,
			requiredFields: ['error_category', 'occurred_on', 'sys_domain', 'error_count'],
			queryFields: [EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION, 'error_category', 'occurred_on', 'sys_domain'],
			updateFields: ['error_count', 'error_ignored_count'],
			initFields: [EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION, 'error_category', 'occurred_on']
		}
	};
	
	/**
	 * Create a configuration key from entityType and statsType
	 * @param {string} entityType - 'code' or 'category'
	 * @param {string} statsType - 'all', 'source', 'instance', or 'timeseries'
	 * @returns {string} Combined key in the format 'entityType.statsType'
	 */
	static getKey(entityType, statsType) {
		return entityType + '.' + statsType;
	}
	
	/**
	 * Get configuration for a specific aggregation type
	 * @param {string} entityType - 'code' or 'category'
	 * @param {string} statsType - 'all', 'source', 'instance', or 'timeseries'
	 * @returns {Object} Configuration object with resolved table and fields
	 * @throws {Error} If no configuration exists for the given type combination
	 */
	static getConfig(entityType, statsType) {
		const key = this.getKey(entityType, statsType);
		const config = this.CONFIGURATIONS[key];
		
		if (!config)
			throw new Error('EFAggregationTypeRegistry.getConfig: No configuration found for ' + key);
		
		// Resolve functions to get actual values
		return {
			table: typeof config.table === 'function' ? config.table() : config.table,
			fields: typeof config.fields === 'function' ? config.fields() : config.fields,
			requiredFields: config.requiredFields,
			queryFields: config.queryFields,
			updateFields: config.updateFields,
			initFields: config.initFields
		};
	}
	
	/**
	 * Validate that data contains all required fields for the aggregation type
	 * @param {Object} data - Data object with database field names as keys
	 * @param {Object} config - Configuration object from getConfig()
	 * @returns {boolean} True if valid, throws error otherwise
	 * @throws {Error} If required fields are missing from data
	 */
	static validate(data, config) {
		if (!config || !config.requiredFields)
			throw new Error('EFAggregationTypeRegistry.validate: Invalid configuration provided');
		
		const missing = [];
		
		for (let i = 0; i < config.requiredFields.length; i++) {
			const field = config.requiredFields[i];
			if (gs.nil(data[field]))
				missing.push(field);
		}
		
		if (missing.length > 0)
			throw new Error('EFAggregationTypeRegistry.validate: Missing required fields: ' + missing.join(', '));
		
		return true;
	}
	
	/**
	 * Check if a specific aggregation type is supported
	 * @param {string} entityType - 'code' or 'category'
	 * @param {string} statsType - 'all', 'source', 'instance', or 'timeseries'
	 * @returns {boolean} True if the type combination is supported
	 */
	static isSupported(entityType, statsType) {
		const key = this.getKey(entityType, statsType);
		return this.CONFIGURATIONS.hasOwnProperty(key);
	}
}
