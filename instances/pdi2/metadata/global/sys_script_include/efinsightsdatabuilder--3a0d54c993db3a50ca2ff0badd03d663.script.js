/**
 * @class EFInsightsDataBuilder
 * @classdesc Pure data API for Error Framework statistics. Gathers, scores, and
 * returns structured data for a given source application error prefix.
 * Uses a fetch-all-then-score strategy with log-dampened severity weighting,
 * recency boost, trend detection, and a severity guarantee.
 */
class EFInsightsDataBuilder {

	// Severity numeric ranges → weight for scoring.
	// Intentionally wide gaps so severity dominates over volume.
	// With log2-dampened counts, critical(10) with count=50 scores higher than low(2) with count=5000.
	static SEVERITY_WEIGHTS = {
		critical: 10, // 0-99
		high: 6,      // 100-199
		medium: 3,    // 200-299
		low: 2        // 300-399
	};

	// Recency multiplier for codes with activity in the configured time range
	static RECENCY_BOOST = 2.0;
	static TREND_BOOSTS = {
		'increasing': 1.3,
		'new': 1.2,
		'stable': 1.0,
		'decreasing': 0.8
	};

	/**
	 * @param {string} errorPrefix - The error prefix from sys_error_appl (e.g. 'SN-DISC', 'SN-CMDB')
	 * @param {Object} [options] - Optional configuration
	 * @param {string} [options.domainPath] - Domain path for sys_domain_path STARTSWITH filtering. When set, takes precedence over exact domain match
	 * @param {string} [options.filterEncodedQuery] - Encoded query string from UI filters (severity, category) to apply to code stats
	 * @param {number} [options.timeRangeDays=30] - Number of days for timeseries lookback
	 * @param {number} [options.maxCodes=30] - Maximum number of error codes to include in final output
	 * @param {number} [options.maxSourcesPerCode=5] - Maximum sources per error code
	 * @param {number} [options.maxSampleErrorCodes=10] - Number of top codes to fetch sample errors for
	 * @param {number} [options.maxSampleErrorsPerCode=2] - Number of sample error records per code
	 */
	constructor(errorPrefix, options = {}) {
		if (typeof options === 'string')
			try { options = JSON.parse(options); } catch (e) { options = {}; }

		if (!errorPrefix)
			throw new Error('EFInsightsDataBuilder: errorPrefix is required');

		this.errorPrefix = errorPrefix;
		this.domainPath = options.domainPath || '';
		this.filterEncodedQuery = options.filterEncodedQuery || '';
		this.timeRangeDays = Math.min(options.timeRangeDays || 30, 90);
		this.maxCodes = options.maxCodes || 30;
		this.maxSourcesPerCode = options.maxSourcesPerCode || 5;
		this.maxSampleErrorCodes = options.maxSampleErrorCodes || 10;
		this.maxSampleErrorsPerCode = options.maxSampleErrorsPerCode || 2;

		const sourceAppGr = EFErrorUtil.getSourceApplicationByPrefix(this.errorPrefix);
		if (!sourceAppGr)
			throw new Error('EFInsightsDataBuilder: Source application not found for prefix: ' + errorPrefix);

		this._sourceAppSysId = sourceAppGr.getUniqueValue();
		this._sourceAppName = sourceAppGr.getValue(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.SOURCE_APPLICATION);

		this._baseCodeStatsCache = null;
		this._scoredCodeStatsCache = null;
	}

	/**
	 * Returns a lightweight summary object using GlideAggregate — no full
	 * record scan needed. Includes the source application name and a
	 * severity breakdown in the human-readable message.
	 *
	 * @returns {Object} Summary with totals and a human-readable message
	 * @returns {string} return.source_application - Application display name
	 * @returns {string} return.error_prefix - Error prefix (e.g. 'SN-DISC')
	 * @returns {string} return.source_app_sys_id - Source application sys_id
	 * @returns {number} return.total_errors - Total error count across all codes
	 * @returns {number} return.total_error_codes - Number of distinct error codes with errors
	 * @returns {number} return.critical_error_codes - Number of critical severity codes
	 * @returns {number} return.high_error_codes - Number of high severity codes
	 * @returns {number} return.medium_error_codes - Number of medium severity codes
	 * @returns {number} return.low_error_codes - Number of low severity codes
	 * @returns {number} return.total_ignored - Total ignored error count
	 * @returns {string} return.message - Human-readable summary sentence
	 */
	getSummary() {
		const agg = this._getAggregatedSummary();

		let message = '';

		if (agg.totalCodes === 0) 
			message = 'There are currently no active errors.';
		else {
			const severityParts = [];
			if (agg.criticalErrors > 0) severityParts.push(`<strong>${this._formatNumber(agg.criticalErrors)}</strong> critical`);
			if (agg.highErrors > 0) severityParts.push(`<strong>${this._formatNumber(agg.highErrors)}</strong> high`);
			if (agg.mediumErrors > 0) severityParts.push(`<strong>${this._formatNumber(agg.mediumErrors)}</strong> medium`);
			if (agg.lowErrors > 0) severityParts.push(`<strong>${this._formatNumber(agg.lowErrors)}</strong> low`);

			if (severityParts.length > 0) 
				message = 'There are currently <strong>' + this._formatNumber(agg.totalErrors) + '</strong> active errors: ' + severityParts.join(', ') + '.';
			else 
				message = 'There are currently <strong>' + this._formatNumber(agg.totalErrors) + '</strong> active errors.';
		}

		return {
			source_application: this._sourceAppName,
			error_prefix: this.errorPrefix,
			source_app_sys_id: this._sourceAppSysId,
			total_errors: agg.totalErrors,
			total_error_codes: agg.totalCodes,
			critical_error_codes: agg.criticalCodes,
			high_error_codes: agg.highCodes,
			medium_error_codes: agg.mediumCodes,
			low_error_codes: agg.lowCodes,
			total_ignored: agg.totalIgnored,
			message: message
		};
	}

	/**
	 * Returns the top N error codes ranked by impact_score, suitable for
	 * rendering as UI cards without any AI call.
	 *
	 * Each card object includes: stats_sys_id, error_code, error_code_name,
	 * error_code_sys_id, severity_label, category_name, error_count,
	 * recent_error_count, error_ignored_count, impact_score.
	 *
	 * @param {number} [maxCards] - Maximum number of cards to return (defaults to maxCodes)
	 * @returns {Array<Object>} Ranked error code card objects
	 */
	getTopErrorCodeCards(maxCards) {
		const { topN } = this._getScoredCodeStats();
		const limit = maxCards || this.maxCodes;
		return topN.slice(0, limit);
	}

	/**
	 * Returns the top N error sources ranked by total error_count across all
	 * error codes for this application. Aggregates from sys_error_code_source_stats
	 * using GlideAggregate, suitable for rendering as UI cards without AI.
	 *
	 * @param {number} [maxCards=10] - Maximum number of source cards to return
	 * @returns {Array<Object>} Ranked source card objects, each with:
	 *   error_source, error_source_table, error_source_display,
	 *   total_error_count, total_ignored_count, error_code_count
	 */
	getTopSourceCards(maxCards) {
		const limit = maxCards || 10;

		const sourceStatsGa = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_SOURCE_STATS);
		sourceStatsGa.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			sourceStatsGa.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		sourceStatsGa.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT, '>', 0);
		sourceStatsGa.addAggregate('SUM', EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT);
		sourceStatsGa.addAggregate('SUM', EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_IGNORED_COUNT);
		sourceStatsGa.addAggregate('COUNT');
		sourceStatsGa.groupBy(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE);
		sourceStatsGa.groupBy(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE_TABLE);
		sourceStatsGa.orderByAggregate('SUM', EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT);
		sourceStatsGa.setLimit(limit);
		sourceStatsGa.query();

		const results = [];
		while (sourceStatsGa.next()) {
			const sourceKey = sourceStatsGa.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE) || '';
			results.push({
				error_source: sourceKey,
				error_source_table: sourceStatsGa.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE_TABLE) || '',
				error_source_display: sourceStatsGa.getDisplayValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE) || sourceKey,
				total_error_count: parseInt(sourceStatsGa.getAggregate('SUM', EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT)) || 0,
				total_ignored_count: parseInt(sourceStatsGa.getAggregate('SUM', EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0,
				error_code_count: parseInt(sourceStatsGa.getAggregate('COUNT')) || 0
			});
		}

		return results;
	}

	/**
	 * Returns the application-level overview: severity and category breakdowns
	 * computed from ALL code_stats candidates. Useful for dashboard display
	 * without AI.
	 *
	 * @returns {Object} Overview with bySeverity, byCategory maps, and totals
	 */
	getApplicationOverview() {
		const all = this._getBaseCodeStats();
		return this._computeApplicationOverview(all);
	}

	/**
	 * Gets error code stats using the fetch-all-then-score strategy.
	 * Returns all candidates (scored) and the top N with severity guarantee.
	 *
	 * @returns {{ all: Array<Object>, topN: Array<Object> }}
	 */
	getCodeStats() {
		return this._getScoredCodeStats();
	}

	/**
	 * Gets source stats for the given error code sys_ids, limited to top M per code.
	 * @param {Array<string>} codeSysIds
	 * @returns {Array<Object>}
	 */
	getCodeSourceStats(codeSysIds) {
		if (!codeSysIds || codeSysIds.length === 0) return [];

		const results = [];
		const countByCode = {};
		const sourceStatsGr = new GlideRecord(EFConstants.TABLES.ERROR_CODE_SOURCE_STATS);
		sourceStatsGr.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			sourceStatsGr.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		sourceStatsGr.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		sourceStatsGr.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT, '>', 0);
		sourceStatsGr.orderByDesc(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT);
		sourceStatsGr.query();

		while (sourceStatsGr.next()) {
			const codeSysId = sourceStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE);
			countByCode[codeSysId] = (countByCode[codeSysId] || 0);

			if (countByCode[codeSysId] >= this.maxSourcesPerCode) continue;
			countByCode[codeSysId]++;

			results.push({
				stats_sys_id: sourceStatsGr.getUniqueValue(),
				error_code: sourceStatsGr.getDisplayValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE),
				error_source_table: sourceStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE_TABLE) || '',
				error_source_sys_id: sourceStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE) || '',
				error_source_display: sourceStatsGr.getDisplayValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_SOURCE) || '',
				error_count: parseInt(sourceStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT)) || 0,
				error_ignored_count: parseInt(sourceStatsGr.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0
			});
		}

		return results;
	}

	/**
	 * Gets timeseries stats for the given error codes over the configured day range.
	 * @param {Array<string>} codeSysIds
	 * @returns {Array<Object>}
	 */
	getCodeTimeSeriesStats(codeSysIds) {
		if (!codeSysIds || codeSysIds.length === 0) return [];

		const results = [];
		const cutoff = new GlideDateTime();
		cutoff.addDaysLocalTime(-this.timeRangeDays);
		const cutoffDate = cutoff.getDate().toString();

		const timeSeriesGa = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_TIMESERIES_STATS);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			timeSeriesGa.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON, '>=', cutoffDate);
		timeSeriesGa.addAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT);
		timeSeriesGa.addAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_IGNORED_COUNT);
		timeSeriesGa.groupBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
		timeSeriesGa.groupBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON);
		timeSeriesGa.orderBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
		timeSeriesGa.orderBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON);
		timeSeriesGa.query();

		while (timeSeriesGa.next()) {
			results.push({
				error_code: timeSeriesGa.getDisplayValue(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE),
				occurred_on: timeSeriesGa.getValue(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON) || '',
				error_count: parseInt(timeSeriesGa.getAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT)) || 0,
				error_ignored_count: parseInt(timeSeriesGa.getAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0
			});
		}

		return results;
	}

	/**
	 * Gets available actions for the given error codes via the M2M table.
	 * @param {Array<string>} codeSysIds
	 * @returns {Array<Object>}
	 */
	getCodeActions(codeSysIds) {
		if (!codeSysIds || codeSysIds.length === 0) return [];

		const results = [];
		const seen = {};
		const actionsGr = new GlideRecord(EFConstants.TABLES.ERROR_ACTIONS_M2M);
		actionsGr.addQuery(EFConstants.ERROR_ACTIONS_M2M_FIELDS.APPLICATION, this._sourceAppSysId);
		actionsGr.addQuery(EFConstants.ERROR_ACTIONS_M2M_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		actionsGr.addQuery(`${EFConstants.ERROR_ACTIONS_M2M_FIELDS.ACTION}.${EFConstants.ERROR_ACTION_FIELDS.ACTIVE}`, true);
		actionsGr.query();

		while (actionsGr.next()) {
			const action = actionsGr[EFConstants.ERROR_ACTIONS_M2M_FIELDS.ACTION];
			const actionSysId = action.sys_id ? action.sys_id.toString() : '';
			const codeSysId = actionsGr.getValue(EFConstants.ERROR_ACTIONS_M2M_FIELDS.ERROR_CODE);
			const dedupeKey = codeSysId + ':' + actionSysId;

			if (seen[dedupeKey]) continue;
			seen[dedupeKey] = true;

			results.push({
				error_code: actionsGr.getDisplayValue(EFConstants.ERROR_ACTIONS_M2M_FIELDS.ERROR_CODE),
				action_name: actionsGr.getDisplayValue(EFConstants.ERROR_ACTIONS_M2M_FIELDS.ACTION),
				action_type: action[EFConstants.ERROR_ACTION_FIELDS.TYPE] ? action[EFConstants.ERROR_ACTION_FIELDS.TYPE].toString() : '',
				action_message: action[EFConstants.ERROR_ACTION_FIELDS.MESSAGE] ? action[EFConstants.ERROR_ACTION_FIELDS.MESSAGE].toString() : ''
			});
		}

		return results;
	}

	/**
	 * Fetches sample error records for the given codes. Provides actual error
	 * detail (message, enriched_context) for pattern detection.
	 * Only fetches active errors (not closed/ignored/inactive), most recent first.
	 *
	 * @param {Array<string>} codeSysIds - Code sys_ids to sample from
	 * @returns {Array<Object>} Sample error records with context
	 */
	getSampleErrors(codeSysIds) {
		if (!codeSysIds || codeSysIds.length === 0) return [];

		const results = [];
		const countByCode = {};
		const excludedStates = `${EFConstants.ERROR_STATES.CLOSED},${EFConstants.ERROR_STATES.IGNORED},${EFConstants.ERROR_STATES.INACTIVE}`;

		const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
		errorGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, this._sourceAppSysId);
		errorGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		errorGr.addQuery(EFConstants.ERROR_FIELDS.STATE, 'NOT IN', excludedStates);
		errorGr.orderByDesc(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE);
		errorGr.query();

		while (errorGr.next()) {
			const codeSysId = errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);
			countByCode[codeSysId] = (countByCode[codeSysId] || 0);

			if (countByCode[codeSysId] >= this.maxSampleErrorsPerCode) continue;
			countByCode[codeSysId]++;

			let enrichedContext = errorGr.getValue(EFConstants.ERROR_FIELDS.CONTEXT) || '';
			if (enrichedContext.length > 500)
				enrichedContext = `${enrichedContext.substring(0, 497)}...`;

			results.push({
				error_code: errorGr.getDisplayValue(EFConstants.ERROR_FIELDS.ERROR_CODE),
				message: this._truncate(errorGr.getValue(EFConstants.ERROR_FIELDS.MESSAGE) || '', 200),
				enriched_context: enrichedContext,
				state: errorGr.getValue(EFConstants.ERROR_FIELDS.STATE) || '',
				last_occurrence: errorGr.getValue(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE) || '',
				error_source_display: errorGr.getDisplayValue(EFConstants.ERROR_FIELDS.ERROR_SOURCE) || '',
				consecutive_count: parseInt(errorGr.getValue(EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT)) || 0,
				reopened_count: parseInt(errorGr.getValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT)) || 0
			});

			// Early-exit once all requested codes have their sample quota filled
			if (codeSysIds.every(id => (countByCode[id] || 0) >= this.maxSampleErrorsPerCode)) break;
		}

		return results;
	}

	/**
	 * Extracts error_code sys_ids from code stats results.
	 * @param {Array<Object>} codeStatsData
	 * @returns {Array<string>}
	 */
	extractCodeSysIds(codeStatsData) {
		return codeStatsData.filter(candidate => candidate.error_code_sys_id).map(candidate => candidate.error_code_sys_id);
	}

	/**
	 * Returns metadata about this builder instance (application, prefix, config).
	 * @returns {Object}
	 */
	getMetadata() {
		return {
			source_application: this._sourceAppName,
			error_prefix: this.errorPrefix,
			source_app_sys_id: this._sourceAppSysId,
			time_range_days: this.timeRangeDays,
			max_codes: this.maxCodes,
			max_sources_per_code: this.maxSourcesPerCode,
			max_sample_error_codes: this.maxSampleErrorCodes,
			max_sample_errors_per_code: this.maxSampleErrorsPerCode,
			recency_boost: EFInsightsDataBuilder.RECENCY_BOOST,
			generated_at: new GlideDateTime().getDisplayValue()
		};
	}

	/**
	 * Runs a single GlideAggregate on sys_error_code_stats grouped by
	 * error_code.severity_label to produce summary totals efficiently
	 * without loading individual records.
	 *
	 * @returns {Object} Aggregated counts: totalErrors, totalIgnored,
	 *   totalCodes, criticalCodes, highCodes, mediumCodes, lowCodes
	 * @private
	 */
	_getAggregatedSummary() {
		const result = {
			totalErrors: 0, totalIgnored: 0, totalCodes: 0,
			criticalCodes: 0, highCodes: 0, mediumCodes: 0, lowCodes: 0,
			criticalErrors: 0, highErrors: 0, mediumErrors: 0, lowErrors: 0
		};

		const ga = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_STATS);
		ga.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			ga.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		ga.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT, '>', 0);
		ga.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.suppress', false);
		ga.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.severity', '<', EFConstants.SEVERITY_VALUES.INFO);
		if (this.filterEncodedQuery)
			ga.addEncodedQuery(this.filterEncodedQuery);
		ga.addAggregate('SUM', EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT);
		ga.addAggregate('SUM', EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_IGNORED_COUNT);
		ga.addAggregate('COUNT');
		ga.groupBy(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.severity_label');
		ga.query();

		while (ga.next()) {
			const sevLabel = ga.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.severity_label') || 'low';
			const codes = parseInt(ga.getAggregate('COUNT')) || 0;
			const errors = parseInt(ga.getAggregate('SUM', EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT)) || 0;
			const ignored = parseInt(ga.getAggregate('SUM', EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0;

			result.totalCodes += codes;
			result.totalErrors += errors;
			result.totalIgnored += ignored;

			if (sevLabel === 'critical') {
				result.criticalCodes += codes;
				result.criticalErrors += errors;
			} else if (sevLabel === 'high') {
				result.highCodes += codes;
				result.highErrors += errors;
			} else if (sevLabel === 'medium') {
				result.mediumCodes += codes;
				result.mediumErrors += errors;
			} else if (sevLabel === 'low') {
				result.lowCodes += codes;
				result.lowErrors += errors;
			}
		}

		return result;
	}

	/**
	 * Converts a severity numeric value (0-499) to a weight for scoring.
	 * Higher weight = more impactful.
	 *
	 * Gaps are intentionally wide so severity dominates over volume:
	 *   critical(10) with count=50 → score 5670
	 *   low(2) with count=5000 → score 2458
	 *
	 * @param {number} severityValue - Numeric severity (0=critical, 100=high, 200=medium, 300=low)
	 * @returns {number} Weight (10 for critical down to 2 for low)
	 * @private
	 */
	_severityWeight(severityValue) {
		if (severityValue < EFConstants.SEVERITY_VALUES.HIGH) return 10;     // critical
		if (severityValue < EFConstants.SEVERITY_VALUES.MEDIUM) return 6;   // high
		if (severityValue < EFConstants.SEVERITY_VALUES.LOW) return 3;      // medium
		return 2;                                                           // low
	}

	/**
	 * Gets recently active error code sys_ids via GlideAggregate on timeseries.
	 * Returns a map of { codeSysId → recentErrorCount } for codes with activity
	 * in the configured time range.
	 * @param {Array<string>} codeSysIds - Candidate code sys_ids to check
	 * @returns {Object} Map of codeSysId → total recent error count
	 * @private
	 */
	_getRecentlyActiveCodes(codeSysIds) {
		const recentCodes = {};

		const cutoff = new GlideDateTime();
		cutoff.addDaysLocalTime(-this.timeRangeDays);
		const cutoffDate = cutoff.getDate().toString();

		const timeSeriesGa = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_TIMESERIES_STATS);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			timeSeriesGa.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON, '>=', cutoffDate);
		timeSeriesGa.addAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT);
		timeSeriesGa.groupBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
		timeSeriesGa.query();

		while (timeSeriesGa.next()) {
			const codeSysId = timeSeriesGa.getValue(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
			recentCodes[codeSysId] = parseInt(timeSeriesGa.getAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT)) || 0;
		}

		return recentCodes;
	}

	/**
	 * Gets the number of distinct error sources per code via GlideAggregate.
	 * Helps assess concentration: 1-2 sources = potential quick win,
	 * many sources = complex cross-cutting issue.
	 *
	 * @param {Array<string>} codeSysIds - Candidate code sys_ids
	 * @returns {Object} Map of codeSysId → source count
	 * @private
	 */
	_getSourceCounts(codeSysIds) {
		const counts = {};
		if (!codeSysIds || codeSysIds.length === 0) return counts;

		const sourceStatsGa = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_SOURCE_STATS);
		sourceStatsGa.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			sourceStatsGa.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		sourceStatsGa.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		sourceStatsGa.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_COUNT, '>', 0);
		sourceStatsGa.addAggregate('COUNT');
		sourceStatsGa.groupBy(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE);
		sourceStatsGa.query();

		while (sourceStatsGa.next()) {
			const codeSysId = sourceStatsGa.getValue(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.ERROR_CODE);
			counts[codeSysId] = parseInt(sourceStatsGa.getAggregate('COUNT')) || 0;
		}

		return counts;
	}

	/**
	 * Computes trend direction per code by comparing error volume in the
	 * first half vs second half of the configured time range.
	 *
	 * Thresholds:
	 *   - second_half > first_half × 1.3 → 'increasing' (worsening)
	 *   - second_half < first_half × 0.7 → 'decreasing' (improving)
	 *   - first_half = 0 AND second_half > 0 → 'new' (emerging problem)
	 *   - otherwise → 'stable'
	 *
	 * @param {Array<string>} codeSysIds - Candidate code sys_ids
	 * @returns {Object} Map of codeSysId → trend string
	 * @private
	 */
	_computeTrends(codeSysIds) {
		const trends = {};
		if (!codeSysIds || codeSysIds.length === 0) return trends;

		const halfDays = Math.floor(this.timeRangeDays / 2);

		const cutoff = new GlideDateTime();
		cutoff.addDaysLocalTime(-this.timeRangeDays);
		const midpoint = new GlideDateTime();
		midpoint.addDaysLocalTime(-halfDays);

		const cutoffDate = cutoff.getDate().toString();
		const midDate = midpoint.getDate().toString();

		const firstHalf = {};
		const secondHalf = {};

		const timeSeriesGa = new GlideAggregate(EFConstants.TABLES.ERROR_CODE_TIMESERIES_STATS);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			timeSeriesGa.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE, 'IN', codeSysIds.join(','));
		timeSeriesGa.addQuery(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON, '>=', cutoffDate);
		timeSeriesGa.addAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT);
		timeSeriesGa.groupBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
		timeSeriesGa.groupBy(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON);
		timeSeriesGa.query();

		while (timeSeriesGa.next()) {
			const codeSysId = timeSeriesGa.getValue(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_CODE);
			const occurredOn = timeSeriesGa.getValue(EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.OCCURRED_ON);
			const count = parseInt(timeSeriesGa.getAggregate('SUM', EFConstants.ERROR_CODE_TIMESERIES_STATS_FIELDS.ERROR_COUNT)) || 0;

			if (occurredOn < midDate) {
				firstHalf[codeSysId] = (firstHalf[codeSysId] || 0) + count;
			} else {
				secondHalf[codeSysId] = (secondHalf[codeSysId] || 0) + count;
			}
		}

		for (const id of codeSysIds) {
			const first = firstHalf[id] || 0;
			const second = secondHalf[id] || 0;

			if (first === 0 && second > 0) trends[id] = 'new';
			else if (first === 0 && second === 0) trends[id] = 'stable';
			else if (second > first * 1.3) trends[id] = 'increasing';
			else if (second < first * 0.7) trends[id] = 'decreasing';
			else trends[id] = 'stable';
		}

		return trends;
	}

	/**
	 * Returns basic code stats needed for summaries without doing the expensive
	 * scoring and trending computations.
	 * @returns {Array<Object>}
	 * @private
	 */
	_getBaseCodeStats() {
		if (this._baseCodeStatsCache) return this._baseCodeStatsCache;

		const candidates = [];
		const candidateCodeSysIds = [];
		const codeStatsGr = new GlideRecord(EFConstants.TABLES.ERROR_CODE_STATS);
		codeStatsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION, this._sourceAppSysId);
		if (this.domainPath)
			codeStatsGr.addQuery(EFConstants.DOMAIN_FIELDS.SYS_DOMAIN_PATH, 'STARTSWITH', this.domainPath);
		codeStatsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT, '>', 0);
		codeStatsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.suppress', false);
		codeStatsGr.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE + '.severity', '<', EFConstants.SEVERITY_VALUES.INFO);
		if (this.filterEncodedQuery)
			codeStatsGr.addEncodedQuery(this.filterEncodedQuery);
		codeStatsGr.orderByDesc(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT);
		codeStatsGr.query();

		while (codeStatsGr.next()) {
			const codeSysId = codeStatsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE);
			const errorCode = codeStatsGr[EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE];
			const severityVal = errorCode.severity
				? parseInt(errorCode.severity.toString()) : 399;

			candidates.push({
				stats_sys_id: codeStatsGr.getUniqueValue(),
				error_code_sys_id: codeSysId,
				error_code: codeStatsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_CODE),
				error_code_name: errorCode.name ? errorCode.name.toString() : '',
				root_cause: errorCode[EFConstants.ERROR_CODE_FIELDS.MESSAGE] ? errorCode[EFConstants.ERROR_CODE_FIELDS.MESSAGE].toString() : '',
				severity: severityVal,
				severity_label: errorCode.severity_label ? errorCode.severity_label.toString() : 'low',
				category_name: codeStatsGr.getDisplayValue(EFConstants.ERROR_CODE_STATS_FIELDS.CATEGORY),
				category_icon: codeStatsGr[EFConstants.ERROR_CODE_STATS_FIELDS.CATEGORY].icon
					? codeStatsGr[EFConstants.ERROR_CODE_STATS_FIELDS.CATEGORY].icon.toString() : 'key-outline',
				error_count: parseInt(codeStatsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_COUNT)) || 0,
				error_ignored_count: parseInt(codeStatsGr.getValue(EFConstants.ERROR_CODE_STATS_FIELDS.ERROR_IGNORED_COUNT)) || 0,
				recent_error_count: 0,
				source_count: 0,
				trend: 'stable',
				impact_score: 0
			});
			candidateCodeSysIds.push(codeSysId);
		}

		if (candidates.length > 0) {
			const recentMap = this._getRecentlyActiveCodes(candidateCodeSysIds);
			for (const candidate of candidates) {
				candidate.recent_error_count = recentMap[candidate.error_code_sys_id] || 0;
			}
		}

		this._baseCodeStatsCache = candidates;
		return this._baseCodeStatsCache;
	}

	/**
	 * Computes full scoring, trends, and guarantees severity representation.
	 * Uses cached base stats if available.
	 * @returns {{ all: Array<Object>, topN: Array<Object> }}
	 * @private
	 */
	_getScoredCodeStats() {
		if (this._scoredCodeStatsCache) return this._scoredCodeStatsCache;

		const candidates = this._getBaseCodeStats();

		if (candidates.length === 0) {
			this._scoredCodeStatsCache = { all: [], topN: [] };
			return this._scoredCodeStatsCache;
		}

		const candidateCodeSysIds = candidates.map(candidate => candidate.error_code_sys_id);
		const sourceCountMap = this._getSourceCounts(candidateCodeSysIds);
		const trendMap = this._computeTrends(candidateCodeSysIds);

		for (const candidate of candidates) {
			const sevWeight = this._severityWeight(candidate.severity);
			const recencyBoost = candidate.recent_error_count > 0 ? EFInsightsDataBuilder.RECENCY_BOOST : 1.0;

			candidate.source_count = sourceCountMap[candidate.error_code_sys_id] || 0;
			candidate.trend = trendMap[candidate.error_code_sys_id] || 'stable';
			const trendBoost = EFInsightsDataBuilder.TREND_BOOSTS[candidate.trend] || 1.0;

			candidate.impact_score = Math.round(sevWeight * Math.log2(candidate.error_count + 1) * recencyBoost * trendBoost * 100);
		}

		candidates.sort((a, b) => b.impact_score - a.impact_score);

		const topN = this._ensureSeverityRepresentation(candidates);

		this._scoredCodeStatsCache = { all: candidates, topN };
		return this._scoredCodeStatsCache;
	}

	/**
	 * Guarantees that all critical and high severity codes are included in the
	 * final top-N selection. If any critical/high codes were pushed out by
	 * lower-severity high-volume codes, they replace the lowest-scored
	 * medium/low entries.
	 *
	 * @param {Array<Object>} sortedCandidates - All candidates, sorted by impact_score DESC
	 * @returns {Array<Object>} Top N candidates with severity guarantee, sorted by impact_score DESC
	 * @private
	 */
	_ensureSeverityRepresentation(sortedCandidates) {
		if (sortedCandidates.length <= this.maxCodes)
			return sortedCandidates.slice();

		const topN = sortedCandidates.slice(0, this.maxCodes);
		const topNIds = new Set(topN.map(candidate => candidate.error_code_sys_id));

		// Find critical/high codes (severity < MEDIUM) that didn't make the cut
		const missed = sortedCandidates
			.slice(this.maxCodes)
			.filter(candidate => candidate.severity < EFConstants.SEVERITY_VALUES.MEDIUM && !topNIds.has(candidate.error_code_sys_id));

		if (missed.length === 0)
			return topN;

		EFInsightsDataBuilder.logger.info(`Severity guarantee: force-including ${missed.length} critical/high codes that were below the top-${this.maxCodes} cutoff`);

		missed.sort((a, b) => b.impact_score - a.impact_score);

		const replaceableIndices = [];
		for (let k = topN.length - 1; k >= 0; k--) {
			if (topN[k].severity >= EFConstants.SEVERITY_VALUES.MEDIUM)
				replaceableIndices.push(k);
		}

		const swapCount = Math.min(missed.length, replaceableIndices.length);
		for (let m = 0; m < swapCount; m++) {
			topN[replaceableIndices[m]] = missed[m];
		}

		topN.sort((a, b) => b.impact_score - a.impact_score);
		return topN;
	}

	/**
	 * Computes application-level overview from ALL code_stats candidates.
	 * Returns structured data (not markdown).
	 *
	 * @param {Array<Object>} allCandidates - All scored candidates
	 * @returns {Object} Overview with bySeverity, byCategory, and totals
	 * @private
	 */
	_computeApplicationOverview(allCandidates) {
		const bySeverity = {};
		const byCategory = {};
		let totalErrors = 0, totalRecent = 0, totalIgnored = 0;

		for (const candidate of allCandidates) {
			const sev = candidate.severity_label;
			if (!bySeverity[sev])
				bySeverity[sev] = { codes: 0, errors: 0, recent: 0, ignored: 0 };
			bySeverity[sev].codes++;
			bySeverity[sev].errors += candidate.error_count;
			bySeverity[sev].recent += candidate.recent_error_count;
			bySeverity[sev].ignored += candidate.error_ignored_count;

			const cat = candidate.category_name || 'Uncategorized';
			if (!byCategory[cat])
				byCategory[cat] = { codes: 0, errors: 0, recent: 0 };
			byCategory[cat].codes++;
			byCategory[cat].errors += candidate.error_count;
			byCategory[cat].recent += candidate.recent_error_count;

			totalErrors += candidate.error_count;
			totalRecent += candidate.recent_error_count;
			totalIgnored += candidate.error_ignored_count;
		}

		return {
			total_codes: allCandidates.length,
			total_errors: totalErrors,
			total_recent: totalRecent,
			total_ignored: totalIgnored,
			by_severity: bySeverity,
			by_category: byCategory
		};
	}

	/**
	 * Truncates a string to maxLen characters, appending '...' if truncated
	 * @param {string} str
	 * @param {number} maxLen
	 * @returns {string}
	 * @private
	 */
	_truncate(str, maxLen) {
		if (!str) return '';
		if (str.length <= maxLen) return str;
		return str.substring(0, maxLen - 3) + '...';
	}

	/**
	 * Formats a number with locale-style comma separators for readability.
	 * @param {number} num
	 * @returns {string}
	 * @private
	 */
	_formatNumber(num) {
		if (num === null || num === undefined) return '0';
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
}

EFInsightsDataBuilder.logger = EFLogger.forClass('EFInsightsDataBuilder');
