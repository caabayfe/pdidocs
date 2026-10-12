function cleanCDCFactTable() {
			var factMapping = new GlideRecord('pa_cdc_fact_mapping');
			factMapping.query();
			while (factMapping.next()) {
				var cdcName = factMapping.getValue("cdc_table_name");
				if (gs.nil(cdcName))
					continue;

				var ageInDays = factMapping.getElement('analytics_source.retention_days');
				var ageInMilliSeconds = getCDCFlatRetentionAgeInMilliSeconds(ageInDays);
				cleanTable(cdcName, ageInMilliSeconds);
			}
		}

		function cleanTable(tableName, ageInMilliSeconds) {
			try{
				var tc = new GlideTableCleaner(tableName, ageInMilliSeconds, 'end_date_time');
				tc.setConditions("end_date_time!=NULL");
				tc.clean();
			} catch (e) {
				gs.error("Error cleaning table: " + tableName + "::" + e);
			}
		}

		function getCDCFlatRetentionAgeInMilliSeconds(ageInDays) {
			if (gs.nil(ageInDays) || ageInDays <= 0)
				ageInDays = gs.getProperty("com.snc.pa.dm.retention_days");

			var ageInMilliSeconds = ageInDays > 0 ? ageInDays * 24 * 60 * 60 * 1000 : 63072000000; /* default retention is 730 days,i.e. 63072000000 milliseconds */
			return ageInMilliSeconds;
		}

		function clearSingleScoreCache() {
			var dimensionRetentionMap = {};
			var dimension = new GlideRecord('pa_cdc_dimension_columns');
			dimension.query();
			while (dimension.next()) {
				var dimensionRetentionDays = dimension.getElement('analytics_source.retention_days');
				dimensionRetentionMap[dimension.getValue('id')] = getSSCacheRetentionStartDate(dimensionRetentionDays);
			}
			var values = Object.keys(dimensionRetentionMap).map(key => dimensionRetentionMap[key]);
			var maxRetentionStart = Math.max(values);
			var minRetentionStart = Math.min(values);
			clearAllExpiredRecords(minRetentionStart, 'pa_dm_single_score_cache', 'score_date');

			var singleScoreCache = new GlideRecord('pa_dm_single_score_cache');
			singleScoreCache.addQuery("score_date<=" + maxRetentionStart);
			singleScoreCache.query();
			while (singleScoreCache.next()) {
				var filter = singleScoreCache.getElement('filter_id.filter');
				//in case filter is not present, ignoring the record
				if (!filter)
					continue;

				var retentionStart = extractRetentionDays(dimensionRetentionMap, filter);
				if (singleScoreCache.getValue('score_date') <= retentionStart)
					singleScoreCache.deleteRecord();

			}
		}

		function clearCacheSegment() {
			var sourceRetentionMap = {};
			var source = new GlideRecord('pa_dm_analytics_source');
			source.query();
			while (source.next()) {
				var sourceRetentionDays = source.getValue('retention_days');
				sourceRetentionMap[source.getValue('id')] = getTimeSeriesCacheRetentionStartDate(sourceRetentionDays);
			}
			var values = Object.keys(sourceRetentionMap).map(key => sourceRetentionMap[key]);
			var maxRetentionStart = Math.max(values);
			var minRetentionStart = Math.min(values);
			clearAllExpiredRecords(minRetentionStart, 'pa_dm_cache_segment', 'start_date');

			var cacheSegment = new GlideRecord('pa_dm_cache_segment');
			cacheSegment.addEncodedQuery("start_date<=" + maxRetentionStart);
			cacheSegment.query();
			while (cacheSegment.next()) {
				var filter = cacheSegment.getElement('filter_id.filter');
				//in case filter is not present, ignoring the record
				if (!filter)
					continue;

				var retentionStart = extractRetentionDays(sourceRetentionMap, filter);
				if (cacheSegment.getValue('start_date') <= retentionStart)
					cacheSegment.deleteRecord();

			}
		}

		function clearAllExpiredRecords(minRetentionStart, table, startDate) {
			var table = new GlideRecord(table);
			table.addEncodedQuery(startDate + "<=" + minRetentionStart);
			table.deleteMultiple();
		}

		function extractRetentionDays(retentionMap, filter) {
			var id = filter.match(/\/(\d+)\//);
			return id ? retentionMap[id[1]] : null;
		}

		function getTimeSeriesCacheRetentionStartDate(ageInDays) {
			var firstDate = new Date(new Date().getTime() - getCDCFlatRetentionAgeInMilliSeconds(ageInDays));
			return firstDate.getFullYear() * 100 + firstDate.getMonth();
		}

		function getSSCacheRetentionStartDate(ageInDays) {
			var firstDate = new Date(new Date().getTime() - getCDCFlatRetentionAgeInMilliSeconds(ageInDays));
			return firstDate.getFullYear() * 10000 + (firstDate.getMonth() + 1) * 100 + firstDate.getDate();
		}

		cleanCDCFactTable();
		clearCacheSegment();
		clearSingleScoreCache();
