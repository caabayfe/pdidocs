/**
 * @class EFErrorCounter
 * @classdesc Utility class for managing and aggregating error statistics in the Error Framework.
 * Provides functionality to update error counts by error code and category for both
 * general application-level statistics and instance-specific statistics.
 * The class uses domain-aware statistics tracking and supports comprehensive parameter handling.
 * @param {string} application - The application identifier to track errors for
 * @param {GlideDateTime|string} [aggregationDate] - Optional date to use for time series aggregation (GlideDateTime object or date string)
 */
class EFErrorCounter {

	/**
	 * Initializes the EFErrorCounter class with a given application identifier.
	 * @param {string} application - The sys_error_appl sys_id to track errors for
	 * @param {GlideDateTime|string} [aggregationDate] - Optional date to use for time series aggregation (GlideDateTime object or date string)
	 * @param {string} [scheduleSysId] - Optional sys_id of the sys_error_agg_schedule record. When provided, watermark state is persisted to sys_error_agg_schedule_state per domain.
	 * @throws {Error} JavaScript Error if the application parameter is not provided or not a string
	 */
	constructor(application, aggregationDate = new GlideDateTime(), scheduleSysId) {
		this._validateApplication(application);
		this._application = application;
		this._aggregationDate = this._processAggregationDate(aggregationDate);
		this._domain = EFErrorUtil.getDomain();
		this._scheduleSysId = scheduleSysId || null;
	}

	/**
	 * Aggregates all errors for the application, including both regular error counts
	 * and time series data. This is the recommended entry point for scheduled aggregation jobs.
	 * When a scheduleSysId was provided to the constructor, the per-domain watermark is loaded
	 * on entry and persisted only on success, so failure-recovery and multi-domain isolation
	 * are handled automatically.
	 * @returns {Object} EFResponse object with success status and aggregation details
	 */
	aggregateCounts() {
		try {
			EFErrorCounter.logger.debug(`Starting count aggregation for application: ${this._application} in domain ${this._domain}`);

			const lastExecution = this._loadDomainWatermark();

			// Early exit if no new errors since last execution
			if (!gs.nil(lastExecution)) {
				const hasNewErrors = this._hasNewErrorsSince(lastExecution);
				if (!hasNewErrors) {
					EFErrorCounter.logger.debug(`No new errors since last execution for application: ${this._application}. Skipping aggregation.`);
					return EFResponse.success({
						application: this._application,
						skipped: true,
						counts: {
							aggregation: {},
							timeseries: {}
						}
					})
						.withMessage(sn_i18n.Message.getMessage('error_framework', 'Count aggregation skipped - no new errors since last execution'))
						.withTimestamp()
						.toJSON();
				}
			}

			const errorCountsResult = this.aggregateErrorCounts();
			const timeSeriesResult = this.aggregateTimeSeriesCounts(lastExecution);

			if (errorCountsResult.state === 'failed')
				throw new Error(errorCountsResult.message || 'Error counts aggregation failed');

			if (timeSeriesResult.state === 'failed')
				throw new Error(timeSeriesResult.message || 'Time series aggregation failed');

			// Combine structured counts from both operations
			const combinedCounts = {
				aggregation: errorCountsResult.counts || {},
				timeseries: timeSeriesResult.counts || {}
			};

			this._persistDomainWatermark(new GlideDateTime().getValue());

			EFErrorCounter.logger.debug(`Count aggregation completed for application: ${this._application} in domain ${this._domain}`);
			return EFResponse.success({
				application: this._application,
				skipped: false,
				counts: combinedCounts
			})
				.withMessage('Count aggregation completed successfully')
				.withTimestamp()
				.toJSON();
		} catch (e) {
			EFErrorCounter.logger.error(`Failed to aggregate counts for application '${this._application} in domain ${this._domain}': ${e.message}`);
			return EFResponse.failure(e)
				.withMessage(`Count aggregation failed with message: ${e.message}`)
				.withTimestamp()
				.toJSON();
		}
	}

	/**
	 * Aggregates all errors for the application and statistics records
	 * for both error codes and categories.
	 * Typically executed from an async scheduled job which does domain iteration for each domain.
	 * @returns {object} Object containing execution state (complete/failed), optional error message, and count details
	 */
	aggregateErrorCounts() {
		try {
			const errorAggregates = this._getErrorAggregates(this._domain);
			const categoryCountMap = {};
			const codeCountMap = {};
			const categorySourceCountMap = {};
			const codeSourceCountMap = {};
			let aggregateData = {};

			while (errorAggregates.next()) {
				aggregateData = this._extractErrorAggregateData(errorAggregates);

				// Create shared parameters for both stats types
				const isIgnored = aggregateData.state === 'ignored';
				const sharedParams = {
					error_source: aggregateData?.errorSource || '',
					error_source_table: aggregateData?.errorSourceTable || '',
					error_category: aggregateData.errorCategory,
					error_code: aggregateData.errorCode,
					error_count: isIgnored ? 0 : (aggregateData?.count || 0),
					error_ignored_count: isIgnored ? (aggregateData?.count || 0) : 0,
					sys_domain: this._domain
				};

				// Use builder pattern to update all count maps in one fluent operation
				const builder = EFCountBuilder.create(sharedParams)
					.updateCategory(categoryCountMap)
					.updateCode(codeCountMap);

				if (!gs.nil(aggregateData.errorSource)) {
					builder
						.updateCategorySource(categorySourceCountMap)
						.updateCodeSource(codeSourceCountMap);
				}

				builder.build();
			}

			// Process stats maps and collect structured count data for each aggregation type
			const sourceCodeCounts = EFAggregationHelper.processStatsMap(codeSourceCountMap, { type: 'source', entityType: 'code' }, this._application);
			const sourceCategoryCounts = EFAggregationHelper.processStatsMap(categorySourceCountMap, { type: 'source', entityType: 'category' }, this._application);
			const allCategoryCounts = EFAggregationHelper.processStatsMap(categoryCountMap, { type: 'all', entityType: 'category' }, this._application);
			const allCodeCounts = EFAggregationHelper.processStatsMap(codeCountMap, { type: 'all', entityType: 'code' }, this._application);

			// Delete stats records for error codes/categories no longer active (all errors closed)
			EFAggregationHelper.deleteStaleStats(codeCountMap, 'code', 'all', this._application, this._domain);
			EFAggregationHelper.deleteStaleStats(categoryCountMap, 'category', 'all', this._application, this._domain);
			EFAggregationHelper.deleteStaleStats(codeSourceCountMap, 'code', 'source', this._application, this._domain);
			EFAggregationHelper.deleteStaleStats(categorySourceCountMap, 'category', 'source', this._application, this._domain);

			return {
				state: 'completed',
				counts: {
					allCode: allCodeCounts,
					allCategory: allCategoryCounts,
					sourceCode: sourceCodeCounts,
					sourceCategory: sourceCategoryCounts
				}
			};
		} catch (e) {
			return {
				state: 'failed',
				message: e && e.message ? e.message : String(e)
			}
		}

	}

	/**
	 * Aggregates time series data for the application.
	 * If the time series data has never been aggregated before (i.e., it is the first run),
	 * all historical time series data is aggregated.
	 * Otherwise, re-aggregates any calendar days in the gap between the watermark date and
	 * today (up to MAX_TIMESERIES_CATCHUP_DAYS), then aggregates today. When the gap exceeds
	 * the cap, falls back to a full historical re-baseline. When no watermark is available,
	 * only today is aggregated.
	 * @param {string|null} [lastExecution] - The last_execution watermark value from sys_error_agg_schedule_state
	 * @returns {object} Object containing execution state (complete/failed), optional error message, and count details
	 */
	aggregateTimeSeriesCounts(lastExecution) {
		try {
			const isCategoryFirstRun = this._hasTimeSeriesRunForApp('category');
			const isCodeFirstRun = this._hasTimeSeriesRunForApp('code');

			// If either is first run, do historical aggregation for both
			if (isCategoryFirstRun || isCodeFirstRun)
				return this._aggregateAllHistoricalTimeSeriesData();

			const todayDate = this._aggregationDate.getDate();
			const lastGDT = this._parseLastExecution(lastExecution);
			if (gs.nil(lastGDT))
				return this._aggregateTimeSeriesDataForDate(todayDate);

			const watermarkDate = lastGDT.getDate();
			if (watermarkDate >= todayDate)
				return this._aggregateTimeSeriesDataForDate(todayDate);

			const gapDays = this._daysBetween(watermarkDate, todayDate);
			if (gapDays > EFErrorCounter.MAX_TIMESERIES_CATCHUP_DAYS) {
				EFErrorCounter.logger.warn(
					`Timeseries watermark gap of ${gapDays} days exceeds catch-up cap; ` +
					`falling back to historical re-aggregation for application ${this._application}`
				);
				return this._aggregateAllHistoricalTimeSeriesData();
			}

			return this._walkTimeSeriesGap(watermarkDate, todayDate);
		} catch (e) {
			return {
				state: 'failed',
				message: e && e.message ? e.message : String(e)
			}
		}
	}

	/**
	 * Updates error code and category instance counts based on a specific error instance.
	 * Aggregates all errors for a specific error instance and updates statistics records
	 * for both error codes and categories at the instance level and source level.
	 * @param {string} errorInstanceID - The error instance identifier to update counts for
	 * @returns {Object} EFResponse object with success status and aggregation details
	 * @throws {Error} JavaScript Error if errorInstanceID is not provided or error code lookup fails
	 */
	aggregateInstanceCounts(errorInstanceID) {
		try {
			EFErrorCounter.logger.debug(`Starting instance count update for: ${errorInstanceID}`);
			this._validateErrorInstanceID(errorInstanceID);

			const errorInstance = this._getErrorInstanceRecord(errorInstanceID);
			if (gs.nil(errorInstance)) {
				EFErrorCounter.logger.debug(`No error instance found for: ${errorInstanceID}`);
				return EFResponse.success({
					application: this._application,
					instance: errorInstanceID,
					counts: {
						instanceCode: EFAggregationHelper.createCountObject('instance', 'code'),
						instanceCategory: EFAggregationHelper.createCountObject('instance', 'category')
					}
				})
					.withMessage('Instance count aggregation completed (no instance found)')
					.withTimestamp()
					.toJSON();
			}

			const instanceData = this._extractInstanceData(errorInstance);
			if (gs.nil(instanceData) || gs.nil(instanceData.domain)) {
				EFErrorCounter.logger.warn(`Error instance data or domain missing for instance: ${errorInstanceID}`);
				return EFResponse.success({
					application: this._application,
					instance: errorInstanceID,
					counts: {
						instanceCode: EFAggregationHelper.createCountObject('instance', 'code'),
						instanceCategory: EFAggregationHelper.createCountObject('instance', 'category')
					}
				})
					.withMessage('Instance count aggregation completed (no instance data or domain)')
					.withTimestamp()
					.toJSON();
			}

			const instanceDomain = instanceData.domain;
			const instanceAggregates = this._getErrorInstanceAggregates(errorInstanceID, instanceDomain);
			const instanceCategoryCountMap = {};
			const instanceCodeCountMap = {};
			const sharedParams = {
				error_instance: errorInstanceID,
				error_instance_table: instanceData.errorInstanceTable || '',
				error_source: instanceData?.errorSource || '',
				error_source_table: instanceData?.errorSourceTable || '',
				sys_domain: instanceDomain || ''
			};

			while (instanceAggregates.next()) {
				const aggregateData = this._extractInstanceAggregateData(instanceAggregates);

				// Add count to shared params for this iteration
				const iterationParams = Object.assign({}, sharedParams, {
					error_category: aggregateData.errorCategory,
					error_code: aggregateData.errorCode,
					error_count: aggregateData?.count || 0
				});

				EFCountBuilder.create(iterationParams)
					.updateCategory(instanceCategoryCountMap)
					.updateCode(instanceCodeCountMap)
					.build();
			}

			// Process stats maps and collect structured count data for instance-level aggregations
			const instanceCodeCounts = EFAggregationHelper.processStatsMap(instanceCodeCountMap, { type: 'instance', entityType: 'code'}, this._application);
			const instanceCategoryCounts = EFAggregationHelper.processStatsMap(instanceCategoryCountMap, { type: 'instance', entityType: 'category'}, this._application);

			EFErrorCounter.logger.debug(`Instance count update completed for: ${errorInstanceID}`);
			return EFResponse.success({
				application: this._application,
				instance: errorInstanceID,
				counts: {
					instanceCode: instanceCodeCounts,
					instanceCategory: instanceCategoryCounts
				}
			})
				.withMessage('Instance count aggregation completed successfully')
				.withTimestamp()
				.toJSON();
		} catch (e) {
			EFErrorCounter.logger.error(`Failed to aggregate instance counts for '${errorInstanceID}': ${e.message}`);
			return EFResponse.failure(e)
				.withMessage(`Instance count aggregation failed with message: ${e.message}`)
				.withTimestamp()
				.toJSON();
		}
	}

	/***************************/
	/* CORE VALIDATION METHODS */
	/***************************/

	/**
	 * Validates the application parameter
	 * @private
	 * @param {string} application - The sys_error_appl sys_id to validate
	 * @throws {Error} JavaScript Error if the application parameter is not provided or not a string
	 */
	_validateApplication(application) {
		if (gs.nil(application))
			throw new Error('EFErrorCounter.initialize: Application parameter is required');

		if (typeof application !== 'string')
			throw new Error('EFErrorCounter.initialize: Application parameter must be a string');
	}

	/**
	 * Validates error instance ID parameter
	 * @private
	 * @param {string} errorInstanceID - The error instance ID to validate
	 * @throws {Error} JavaScript Error if errorInstanceID is not provided
	 */
	_validateErrorInstanceID(errorInstanceID) {
		if (gs.nil(errorInstanceID))
			throw new Error('EFErrorCounter.aggregateInstanceCounts: errorInstanceID is required');
	}

	/************************/
	/* CORE UTILITY METHODS */
	/************************/

	/***********************/
	/* DATA ACCESS METHODS */
	/***********************/

	/**
	 * Retrieves error instance record for a given error instance ID
	 * @private
	 * @param {string} errorInstanceID - The error instance ID to look up
	 * @returns {GlideRecord|null} The error instance record or null if not found
	 */
	_getErrorInstanceRecord(errorInstanceID) {
		const errorInstanceGR = new GlideRecord(EFConstants.TABLES.ERROR_INSTANCE);
		errorInstanceGR.addQuery(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_INSTANCE, errorInstanceID);
		errorInstanceGR.setLimit(1);
		errorInstanceGR.query();

		return errorInstanceGR.next() ? errorInstanceGR : null;
	}

	/***************************************/
	/* aggregateErrorCounts Helper Methods */
	/***************************************/

	/**
	 * Creates and returns error aggregates query for application-level statistics
	 * @private
	 * @returns {GlideAggregate} Configured GlideAggregate query for error counts by error code
	 */
	_getErrorAggregates(currentDomain) {
		/* We can only access specific fields we need for populating our stats records
		 * by adding them as groupBy fields.
		 *
		 * This has the downstream effect of requiring more complex logic to maintain
		 * our various error counts across different aggregation column combinations.
		 *
		 * We chose this implementation to maintain performance by shifting multiple
		 * db aggregation queries to manual calculations in memory.
		 */
		const errorGA = new GlideAggregate(EFConstants.TABLES.ERROR);
		errorGA.addAggregate('COUNT');
		errorGA.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, this._application);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.STATE, 'NOT IN', EFConstants.INACTIVE_ERROR_STATES);
		errorGA.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, currentDomain);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE, '!=', '');
		errorGA.groupBy(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE);
		errorGA.groupBy(EFConstants.ERROR_FIELDS.CATEGORY);
		errorGA.groupBy(EFConstants.ERROR_FIELDS.ERROR_SOURCE);
		errorGA.groupBy(EFConstants.ERROR_FIELDS.ERROR_SOURCE_TABLE);
		errorGA.groupBy(EFConstants.ERROR_FIELDS.STATE);
		errorGA.setCategory('EF_Error_Aggregation');
		errorGA.query();
		return errorGA;
	}

	/**
	 * Extracts count and error code from an aggregate record
	 * @private
	 * @param {GlideAggregate} aggregateRecord - The GlideAggregate record containing count information
	 * @returns {Object} Object containing count and errorCode values
	 */
	_extractErrorAggregateData(aggregateRecord) {
		const count = parseInt(aggregateRecord.getAggregate('COUNT'), 10);

		return {
			count: count,
			errorCode: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE),
			errorCategory: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.CATEGORY),
			errorSource: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.ERROR_SOURCE),
			errorSourceTable: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.ERROR_SOURCE_TABLE),
			state: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.STATE),
		};
	}

	/********************************************/
	/* aggregateTimeSeriesCounts Helper Methods */
	/********************************************/

	/**
	 * Check if time series aggregation has ever been run for application
	 * @private
	 * @param {string} entityType - The entity type ('category' or 'code')
	 * @returns {boolean} true if this is the first run (no existing records), false otherwise
	 */
	_hasTimeSeriesRunForApp(entityType) {
		const tableConfig = entityType === 'category'
			? { table: EFConstants.TABLES.ERROR_CATEGORY_TIMESERIES_STATS, appField: EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION }
			: { table: EFConstants.TABLES.ERROR_CODE_TIMESERIES_STATS, appField: EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION };

		const timeseriesGR = new GlideRecord(tableConfig.table);
		timeseriesGR.addQuery(tableConfig.appField, this._application);
		timeseriesGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		timeseriesGR.setLimit(1);
		timeseriesGR.query();
		return !timeseriesGR.hasNext();
	}

	/**
	 * Aggregates time series data for all historical dates with errors
	 * @private
	 * @returns {object} Object containing execution state (complete/failed) and optional error message
	 */
	_aggregateAllHistoricalTimeSeriesData() {
		try {
			const distinctDates = this._getDistinctErrorDates();
			const counts = {
				timeseriesCategory: this._aggregateHistoricalTimeseries(distinctDates, 'category'),
				timeseriesCode: this._aggregateHistoricalTimeseries(distinctDates, 'code')
			};

			return { state: 'completed', counts };
		} catch (e) {
			return {
				state: 'failed',
				message: e && e.message ? e.message : String(e)
			};
		}
	}

	/**
	 * Aggregates historical timeseries data for the given dates
	 * @private
	 * @param {Array} distinctDates - Array of date strings to aggregate
	 * @param {string} entityType - The entity type ('category' or 'code')
	 * @returns {Object} Timeseries counts for the specified entity type
	 */
	_aggregateHistoricalTimeseries(distinctDates, entityType) {
		const countMap = {};
		const isCategory = entityType === 'category';
		const entityField = isCategory ? 'errorCategory' : 'errorCode';
		const paramField = isCategory ? 'error_category' : 'error_code';

		distinctDates.forEach(dayString => {
			const aggregates = this._getAggregatesForDate(dayString, entityType);

			while (aggregates.next()) {
				const aggregateData = this._extractAggregateData(aggregates, entityType);
				const entityValue = aggregateData[entityField];

				if (gs.nil(entityValue)) {
					EFErrorCounter.logger.warn(`Found error without ${entityType} on ${dayString}`);
					continue;
				}

				const key = entityValue + '_' + dayString;
				const isIgnored = aggregateData.state === 'ignored';
				const sharedParams = {
					[paramField]: entityValue,
					error_count: isIgnored ? 0 : (aggregateData.count || 0),
					error_ignored_count: isIgnored ? (aggregateData?.count || 0) : 0,
					sys_domain: this._domain
				};

				const builder = EFCountBuilder.create(sharedParams);
				if (isCategory)
					builder.updateCategoryTimeseries(countMap, key, dayString);
				else
					builder.updateCodeTimeseries(countMap, key, dayString);
				builder.build();
			}
		});

		return EFAggregationHelper.processStatsMap(
			countMap,
			{ type: 'timeseries', entityType },
			this._application
		);
	}

	/**
	 * Gets distinct dates for which there are error records
	 * @private
	 * @returns {Array} Array of GlideDate strings representing distinct days with errors
	 */
	_getDistinctErrorDates() {
		const seenDates = new Set();

		// Get all error instances for this application and domain
		const errorGR = new GlideRecord(EFConstants.TABLES.ERROR);
		errorGR.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, this._application);
		errorGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		errorGR.orderBy(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE);
		errorGR.query();

		while (errorGR.next()) {
			// Extract just the date portion using GlideDateTime API
			const occurrenceDateTime = new GlideDateTime(errorGR.getValue(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE));
			const occurrenceDateString = occurrenceDateTime.getDate();

			// Only add unique dates
			if (!seenDates.has(occurrenceDateString)) {
				seenDates.add(occurrenceDateString);
			}
		}

		return [...seenDates];
	}

	/**
	 * Aggregates time series data for a specific date
	 * @private
	 * @param {string} date - The date to aggregate data for
	 * @returns {object} Object containing execution state (complete/failed) and optional error message
	 */
	_aggregateTimeSeriesDataForDate(date) {
		try {
			const counts = {
				timeseriesCategory: this._aggregateTimeseriesForDate(date, 'category'),
				timeseriesCode: this._aggregateTimeseriesForDate(date, 'code')
			};

			return { state: 'completed', counts };
		} catch (e) {
			return {
				state: 'failed',
				message: e && e.message ? e.message : String(e)
			};
		}
	}

	/**
	 * Aggregates timeseries data for a specific date and entity type
	 * @private
	 * @param {string} date - The date to aggregate data for
	 * @param {string} entityType - The entity type ('category' or 'code')
	 * @returns {Object} Timeseries counts for the specified entity type
	 */
	_aggregateTimeseriesForDate(date, entityType) {
		const aggregates = this._getAggregatesForDate(date, entityType);
		const countMap = {};
		const isCategory = entityType === 'category';
		const entityField = isCategory ? 'errorCategory' : 'errorCode';
		const paramField = isCategory ? 'error_category' : 'error_code';

		while (aggregates.next()) {
			const aggregateData = this._extractAggregateData(aggregates, entityType);
			const entityValue = aggregateData[entityField];

			if (gs.nil(entityValue)) {
				EFErrorCounter.logger.warn(`Found error instance without ${entityType} on ${date}`);
				continue;
			}

			const key = entityValue + '_' + date;
			const isIgnored = aggregateData.state === 'ignored';
			const sharedParams = {
				[paramField]: entityValue,
				error_count: isIgnored ? 0 : (aggregateData.count || 0),
				error_ignored_count: isIgnored ? (aggregateData?.count || 0) : 0,
				sys_domain: this._domain
			};

			const builder = EFCountBuilder.create(sharedParams);
			if (isCategory)
				builder.updateCategoryTimeseries(countMap, key, date);
			else
				builder.updateCodeTimeseries(countMap, key, date);
			builder.build();
		}

		return EFAggregationHelper.processStatsMap(
			countMap,
			{ type: 'timeseries', entityType },
			this._application
		);
	}

	/**
	 * Gets aggregates for a specific date and entity type
	 * @private
	 * @param {string} date - The date to get aggregates for
	 * @param {string} entityType - The entity type ('category' or 'code')
	 * @returns {GlideAggregate} GlideAggregate with counts for the specified date and entity type
	 */
	_getAggregatesForDate(date, entityType) {
		const startOfDay = new GlideDateTime(date + " 00:00:00");
		const endOfDay = new GlideDateTime(date + " 23:59:59");
		const groupByField = entityType === 'category'
			? EFConstants.ERROR_FIELDS.CATEGORY
			: EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE;

		const errorGA = new GlideAggregate(EFConstants.TABLES.ERROR);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, this._application);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.STATE, '!=', 'closed');
		errorGA.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE, '>=', startOfDay);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE, '<', endOfDay);
		errorGA.addQuery(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE, '!=', '');
		errorGA.addAggregate('COUNT');
		errorGA.groupBy(groupByField);
		errorGA.groupBy(EFConstants.ERROR_FIELDS.STATE);
		errorGA.query();
		return errorGA;
	}

	/**
	 * Extracts aggregate data from an aggregate record based on entity type
	 * @private
	 * @param {GlideAggregate} aggregateRecord - The GlideAggregate record containing data
	 * @param {string} entityType - The entity type ('category' or 'code')
	 * @returns {Object} Object containing extracted aggregate data
	 */
	_extractAggregateData(aggregateRecord, entityType) {
		const count = parseInt(aggregateRecord.getAggregate('COUNT'), 10);
		const entityField = entityType === 'category'
			? EFConstants.ERROR_FIELDS.CATEGORY
			: EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE;
		const entityKey = entityType === 'category' ? 'errorCategory' : 'errorCode';

		return {
			count,
			[entityKey]: aggregateRecord.getValue(entityField),
			state: aggregateRecord.getValue(EFConstants.ERROR_FIELDS.STATE),
		};
	}

	/********************************************/
	/* aggregateInstanceCounts Helper Methods */
	/********************************************/

	/**
	 * Creates and returns error instance aggregates query for a specific error instance
	 * @private
	 * @param {string} errorInstanceID - The error instance ID to get aggregates for
	 * @param {string} currentDomain - The domain to filter by
	 * @returns {GlideAggregate} Configured error instance aggregates query
	 */
	_getErrorInstanceAggregates(errorInstanceID, currentDomain) {
		const errorInstanceGA = new GlideAggregate(EFConstants.TABLES.ERROR_INSTANCE);
		errorInstanceGA.addAggregate('COUNT');
		errorInstanceGA.addQuery(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_INSTANCE, errorInstanceID);
		errorInstanceGA.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, '=', currentDomain);
		errorInstanceGA.addQuery(EFConstants.ERROR_INSTANCE_FIELDS.ERROR + '.refined_error_code', '!=', '');
		errorInstanceGA.groupBy(EFConstants.ERROR_INSTANCE_FIELDS.ERROR + '.refined_error_code');
		errorInstanceGA.groupBy(EFConstants.ERROR_INSTANCE_FIELDS.ERROR + '.error_category');
		errorInstanceGA.query();
		return errorInstanceGA;
	}

	/**
	 * Extracts count and error code from an error instance aggregate record
	 * @private
	 * @param {GlideAggregate} aggregateRecord - The GlideAggregate record containing count information
	 * @returns {Object} Object containing count and errorCode values
	 */
	_extractInstanceAggregateData(aggregateRecord) {
		return {
			count: parseInt(aggregateRecord.getAggregate('COUNT'), 10),
			errorCode: aggregateRecord.getValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR + '.refined_error_code'),
			errorCategory: aggregateRecord.getValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR + '.error_category'),
		}
	}

	/**
	 * Extracts instance data from error instance record
	 * @private
	 * @param {GlideRecord} errorInstance - The error instance GlideRecord
	 * @returns {Object} Object containing extracted instance data (source, tables, domain)
	 */
	_extractInstanceData(errorInstance) {
		const fields = EFConstants.ERROR_INSTANCE_FIELDS;
		return {
			errorSource: errorInstance.getValue(fields.ERROR_SOURCE),
			errorSourceTable: errorInstance.getValue(fields.ERROR_SOURCE_TABLE),
			errorInstanceTable: errorInstance.getValue(fields.ERROR_INSTANCE_TABLE),
			domain: errorInstance.getValue(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN)
		};
	}

	/**
	 * Loads the per-domain watermark (last_execution) for this application+domain from
	 * sys_error_agg_schedule_state. Returns null when no scheduleSysId is set (ad-hoc
	 * invocations) or when no state row exists yet (first-run semantics: proceed).
	 * @private
	 * @returns {string|null} The last_execution timestamp string, or null
	 */
	_loadDomainWatermark() {
		if (gs.nil(this._scheduleSysId))
			return null;
		const stateGR = new GlideRecord(EFConstants.TABLES.AGG_SCHEDULE_STATE);
		stateGR.addQuery(EFConstants.AGG_SCHEDULE_STATE_FIELDS.SCHEDULE, this._scheduleSysId);
		stateGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		stateGR.setLimit(1);
		stateGR.query();
		return stateGR.next() ? stateGR.getValue(EFConstants.AGG_SCHEDULE_STATE_FIELDS.LAST_EXECUTION) : null;
	}

	/**
	 * Persists the per-domain watermark for this application+domain to
	 * sys_error_agg_schedule_state. No-ops when no scheduleSysId is set.
	 * Only called on the success path of aggregateCounts so failure never
	 * advances the watermark.
	 * @private
	 * @param {string} now - The timestamp string to store as last_execution
	 */
	_persistDomainWatermark(now) {
		if (gs.nil(this._scheduleSysId))
			return;
		const stateGR = new GlideRecord(EFConstants.TABLES.AGG_SCHEDULE_STATE);
		stateGR.addQuery(EFConstants.AGG_SCHEDULE_STATE_FIELDS.SCHEDULE, this._scheduleSysId);
		stateGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		stateGR.setLimit(1);
		stateGR.query();
		if (stateGR.next()) {
			stateGR.setValue(EFConstants.AGG_SCHEDULE_STATE_FIELDS.LAST_EXECUTION, now);
			stateGR.update();
		} else {
			stateGR.initialize();
			stateGR.setValue(EFConstants.AGG_SCHEDULE_STATE_FIELDS.SCHEDULE, this._scheduleSysId);
			stateGR.setValue(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
			stateGR.setValue(EFConstants.AGG_SCHEDULE_STATE_FIELDS.LAST_EXECUTION, now);
			stateGR.insert();
		}
	}

	/**
	 * Processes the aggregation date parameter to ensure it's a GlideDateTime object
	 * @private
	 * @param {GlideDateTime|string|null} aggregationDate - The aggregation date as GlideDateTime object, string, or null
	 * @returns {GlideDateTime} A GlideDateTime object
	 */
	_processAggregationDate(aggregationDate) {
		// Handle null or undefined - return default current date/time
		if (gs.nil(aggregationDate))
			return new GlideDateTime();

		if (typeof aggregationDate === 'object' && aggregationDate instanceof GlideDateTime)
			return aggregationDate;

		let gdt;
		if (typeof aggregationDate === 'string') {
			gdt = new GlideDateTime(aggregationDate);
			if (gdt)
				return gdt;
		}
	
		// Fallback to current date/time for any other case
		return new GlideDateTime();
	}

	/**
	 * Parses a lastExecution value strictly — returns null for nil or unparseable input.
	 * Distinct from _processAggregationDate, which falls back to now() (appropriate for
	 * the aggregation-date constructor path but wrong here: "now" as watermark would
	 * silently cause _hasNewErrorsSince to always return false).
	 * @private
	 */
	_parseLastExecution(lastExecution) {
		if (gs.nil(lastExecution))
			return null;
		if (lastExecution instanceof GlideDateTime)
			return lastExecution;
		const gdt = new GlideDateTime(lastExecution);
		return gdt.getValue() ? gdt : null;
	}

	/**
	 * Checks if there are any new or updated errors since the last execution timestamp.
	 * Uses sys_updated_on across all states so that any change — new occurrence, refine,
	 * state transition, etc. — invalidates the early-exit. Aggregation is idempotent so
	 * false positives (e.g. field edits that don't affect counts) only cause redundant
	 * work, not incorrect results.
	 * @private
	 * @param {GlideDateTime|string} lastExecution - The last execution timestamp
	 * @returns {boolean} True if there are new or updated errors, false otherwise
	 */
	_hasNewErrorsSince(lastExecution) {
		const lastExecutionGDT = this._parseLastExecution(lastExecution);
		if (gs.nil(lastExecutionGDT))
			return true; // nil or unparseable → proceed; aggregation is idempotent

		const errorGR = new GlideRecord(EFConstants.TABLES.ERROR);
		errorGR.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, this._application);
		errorGR.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN, this._domain);
		errorGR.addQuery(EFConstants.ERROR_FIELDS.SYS_UPDATED_ON, '>', lastExecutionGDT);
		errorGR.setLimit(1);
		errorGR.query();
		return errorGR.hasNext();
	}

	/**
	 * Re-aggregates timeseries for each calendar day from fromDate through toDate inclusive.
	 * Returns failure immediately if any day fails (caller then withholds watermark advance).
	 * @private
	 * @param {string} fromDate - Start date string 'YYYY-MM-DD'
	 * @param {string} toDate - End date string 'YYYY-MM-DD'
	 * @returns {object} Object with state and merged counts from all days
	 */
	_walkTimeSeriesGap(fromDate, toDate) {
		const cumulativeCounts = { timeseriesCategory: [], timeseriesCode: [] };
		const cursor = new GlideDateTime(fromDate + ' 00:00:00');
		const stop = new GlideDateTime(toDate + ' 00:00:00');
		while (!cursor.after(stop)) {
			const dateStr = cursor.getDate();
			const result = this._aggregateTimeSeriesDataForDate(dateStr);
			if (result.state === 'failed')
				return result;
			cumulativeCounts.timeseriesCategory.push(...(result.counts?.timeseriesCategory || []));
			cumulativeCounts.timeseriesCode.push(...(result.counts?.timeseriesCode || []));
			cursor.addDaysLocalTime(1);
		}
		return { state: 'completed', counts: cumulativeCounts };
	}

	/**
	 * Returns the number of whole calendar days between two 'YYYY-MM-DD' strings.
	 * @private
	 * @param {string} fromDateStr
	 * @param {string} toDateStr
	 * @returns {number}
	 */
	_daysBetween(fromDateStr, toDateStr) {
		const gd = new GlideDuration(
			new GlideDateTime(toDateStr + ' 00:00:00').getNumericValue() -
			new GlideDateTime(fromDateStr + ' 00:00:00').getNumericValue()
		);
		return gd.getDayPart();
	}
}

// Initialize logger for the class
EFErrorCounter.logger = EFLogger.forClass('EFErrorCounter');
EFErrorCounter.MAX_TIMESERIES_CATCHUP_DAYS = 7;
