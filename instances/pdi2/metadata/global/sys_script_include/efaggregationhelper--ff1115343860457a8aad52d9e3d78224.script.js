/**
 * Utility class for aggregation helper functions and stats processing
 * Contains extracted utility methods from EFErrorCounter for better separation of concerns
 * Works alongside EFCountBuilder for comprehensive aggregation support
 */
class EFAggregationHelper {
	
	/**
	 * Creates a structured count object for different aggregation types
	 * @param {string} type - The aggregation type ('all', 'source', 'instance', 'timeseries')
	 * @param {string} entityType - The entity type ('code', 'category')
	 * @returns {Object} Structured count object with initialized values
	 */
	static createCountObject(type, entityType) {
		return {
			type: type,
			entityType: entityType,
			error_count: 0,
			error_ignored_count: 0,
			processedRecords: 0,
			statsCreated: 0,
			statsUpdated: 0,
			skippedRecords: 0
		};
	}
	
	/**
	 * Aggregates count data from a data map for tracking purposes
	 * @param {Object} dataMap - Map of data to analyze
	 * @param {string} type - The aggregation type ('all', 'source', 'instance', 'timeseries')
	 * @param {string} entityType - The entity type ('code', 'category')
	 * @returns {Object} Aggregated count object
	 */
	static aggregateCountsFromMap(dataMap, type, entityType) {
		const counts = this.createCountObject(type, entityType);

		for (const key in dataMap) {
			const data = dataMap[key];
			counts.error_count += data.error_count || 0;
			counts.error_ignored_count += data.error_ignored_count || 0;
			counts.processedRecords++;
		}

		return counts;
	}

	/**
	 * Generic method for updating stats records (works for both error code and category stats)
	 * Uses EFAggregationTypeRegistry for data-driven field assignment
	 * Expects data parameter to use database field names as keys (e.g., 'error_code', 'error_category')
	 * @param {Object} data - Data with database field names as keys
	 * @param {string} entityType - Type of entity ('code' or 'category')
	 * @param {string} statsType - Type of stats to update ('instance', 'source', 'all', or 'timeseries')
	 * @param {string} application - The application identifier
	 * @returns {Object} Object with isNew property indicating if record was created
	 */
	static updateStats(data, entityType, statsType, application) {
		if (!data || typeof data !== 'object')
			throw new Error('EFAggregationHelper.updateStats: data parameter is required and must be an object');
		if (!entityType || !statsType)
			throw new Error('EFAggregationHelper.updateStats: entityType and statsType are required');
		if (gs.nil(application))
			throw new Error('EFAggregationHelper.updateStats: application parameter is required');
		
		// Get configuration from registry and validate data
		const config = EFAggregationTypeRegistry.getConfig(entityType, statsType);
		EFAggregationTypeRegistry.validate(data, config);
		
		const result = this.getOrCreateStatsRecord(data, config, application);
		const statsRecord = result.record;
		const isNew = result.isNew;
		
		// Set initialization fields (only for new records) - data-driven approach
		if (isNew) {
			for (let i = 0; i < config.initFields.length; i++) {
				const fieldName = config.initFields[i];
				if (!gs.nil(data[fieldName])) {
					statsRecord.setValue(fieldName, data[fieldName]);
				}
			}
			// Always set application on new records
			statsRecord.setValue(config.fields.APPLICATION, application);
		}
		
		// Set/update fields that are always updated - data-driven approach
		for (let i = 0; i < config.updateFields.length; i++) {
			const fieldName = config.updateFields[i];
			if (!gs.nil(data[fieldName])) {
				statsRecord.setValue(fieldName, data[fieldName]);
			}
		}
		
		// Always set domain
		statsRecord.setValue(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, data.sys_domain || data[EFConstants.DOMAIN_FIELDS.SYS_DOMAIN]);
		
		statsRecord.update();
		
		return { isNew: isNew };
	}

	/**
	 * Gets or creates a stats record based on provided data
	 * Uses EFAggregationTypeRegistry for data-driven query field assignment
	 * Expects data parameter to use database field names as keys (e.g., 'error_code', 'error_category')
	 * @param {Object} data - Data with database field names as keys
	 * @param {Object} config - Configuration object for stats record
	 * @param {string} config.table - The table name to create or retrieve the record from
	 * @param {Object} config.fields - Field mapping for the stats table
	 * @param {Array<string>} config.queryFields - Database field names to use in the query
	 * @param {string} application - The application identifier
	 * @returns {Object} Object containing the stats record and whether it's new
	 * @returns {GlideRecord} returns.record - The GlideRecord object for the stats record
	 * @returns {boolean} returns.isNew - Whether a new record was created
	 */
	static getOrCreateStatsRecord(data, config, application) {
		if (!data || typeof data !== 'object')
			throw new Error('EFAggregationHelper.getOrCreateStatsRecord: data parameter is required and must be an object');
		if (!config || !config.table || !config.fields)
			throw new Error('EFAggregationHelper.getOrCreateStatsRecord: config parameter must have table and fields properties');
		if (gs.nil(application))
			throw new Error('EFAggregationHelper.getOrCreateStatsRecord: application parameter is required');
		
		const statsRecord = new GlideRecord(config.table);
		
		// Add queries based on configuration - data-driven approach using database field names
		for (let i = 0; i < config.queryFields.length; i++) {
			const fieldName = config.queryFields[i];
			// Special handling for application field
			if (fieldName === config.fields.APPLICATION) {
				statsRecord.addQuery(fieldName, application);
			} else if (!gs.nil(data[fieldName])) {
				statsRecord.addQuery(fieldName, data[fieldName]);
			}
		}
		
		statsRecord.query();
		
		const isNewRecord = !statsRecord.next();
		if (isNewRecord)
			statsRecord.initialize();
		
		return {
			record: statsRecord,
			isNew: isNewRecord
		};
	}
	
	/**
	 * Generic method to process stats maps and update database records
	 * Expects dataMap entries to use database field names as keys (e.g., 'error_code', 'error_category')
	 * IMPORTANT: Each entry in dataMap must include all required fields (e.g., 'sys_domain', 'error_count')
	 * Required fields vary based on entityType and statsType - see EFAggregationTypeRegistry.CONFIGURATIONS
	 * @param {Object} dataMap - Map of data to process (with database field names as keys)
	 * @param {Object} baseParams - Base parameters including entityType and type (statsType)
	 * @param {string} application - The application identifier
	 * @param {Function} [mapFn] - Optional function to transform each entry to add additional fields
	 * @returns {Object} Count object with detailed statistics about the processing
	 */
	static processStatsMap(dataMap, baseParams, application, mapFn = null) {
		if (!dataMap || typeof dataMap !== 'object')
			return this.createCountObject('all', 'category');
		if (!baseParams || typeof baseParams !== 'object' || !baseParams.type || !baseParams.entityType)
			return this.createCountObject('all', 'category');
		if (gs.nil(application))
			return this.createCountObject(baseParams.type || 'all', baseParams.entityType || 'category');

		// Check if dataMap contains malformed data - return empty result if so
		for (const key in dataMap) {
			const data = dataMap[key];
			if (!data)
				return this.createCountObject(baseParams.type || 'all', baseParams.entityType || 'category');
		}

		// Create count object based on baseParams
		const counts = this.aggregateCountsFromMap(dataMap, baseParams.type, baseParams.entityType);
		let statsCreated = 0;
		let statsUpdated = 0;

		for (const key in dataMap) {
			try {
				const data = dataMap[key];

				// Start with data that already has database field names
				const dbData = Object.assign({}, data);

				// Apply custom mapping function if provided (for special cases)
				if (mapFn) {
					const customFields = mapFn(key, data);
					Object.assign(dbData, customFields);
				}

				// Update stats and track if record was created or updated
				const updateResult = this.updateStats(dbData, baseParams.entityType, baseParams.type, application);
				if (updateResult.isNew)
					statsCreated++;
				else
					statsUpdated++;
			} catch (e) {
				EFAggregationHelper.logger.warn('Skipping stats entry ' + key + ': ' + e.message);
				counts.skippedRecords++;
			}
		}

		// Update the counts object with actual database operation results
		counts.statsCreated = statsCreated;
		counts.statsUpdated = statsUpdated;

		return counts;
	}
	/**
	 * Deletes stats records that are no longer represented in the active count map.
	 * Called after aggregation to clean up records for error codes/categories where all
	 * errors have been closed (which would produce no rows in the aggregate query).
	 * @param {Object} activeKeys - Count map whose keys represent currently-active aggregates
	 * @param {string} entityType - Type of entity ('code' or 'category')
	 * @param {string} statsType - Type of stats ('all' or 'source')
	 * @param {string} application - The application identifier
	 * @param {string} domain - The sys_domain value
	 * @returns {number} Count of deleted records
	 */
	static deleteStaleStats(activeKeys, entityType, statsType, application, domain) {
		if (!activeKeys || typeof activeKeys !== 'object') return 0;
		if (gs.nil(application) || gs.nil(domain)) return 0;

		const config = EFAggregationTypeRegistry.getConfig(entityType, statsType);
		const entityField = entityType === 'code' ? 'error_code' : 'error_category';

		const statsGR = new GlideRecord(config.table);
		statsGR.addQuery(config.fields.APPLICATION, application);
		statsGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, domain);
		statsGR.addQuery('error_count', '>', 0).addOrCondition('error_ignored_count', '>', 0);
		statsGR.query();

		let deleted = 0;
		while (statsGR.next()) {
			const entityValue = statsGR.getValue(entityField);
			const key = statsType === 'source'
				? entityValue + '|' + statsGR.getValue('error_source') + '|' + statsGR.getValue('error_source_table')
				: entityValue;

			if (!activeKeys.hasOwnProperty(key)) {
				statsGR.deleteRecord();
				deleted++;
			}
		}

		return deleted;
	}
}

// Initialize logger for the class
EFAggregationHelper.logger = EFLogger.forClass('EFAggregationHelper');
