(function executeInstanceEligibilityJob() {
    try {
        gs.info('Data Snapshots InstanceEligibilityJob: Starting eligibility check');

        if (SNC.EnableMLB.isInstanceEligibleForDataSnapshots()) {
            if (GlidePropertiesDB.get('com.snc.pa.dm.enable.mlb', 'true') == 'false') {
                gs.info('Data Snapshots InstanceEligibilityJob: Eligible - enabling Data Snapshots');
                new InstanceReadinessForDS().enableDatasnapshots();
                gs.info('Data Snapshots InstanceEligibilityJob: Enabled');
            } else {
                gs.info('Data Snapshots InstanceEligibilityJob: Data Snapshots is already enabled, no action performed');
            }
        } else {
            if (GlidePropertiesDB.get('com.snc.pa.dm.enable.mlb', 'true') == 'true') {
                disableAndCreateGaps('Instance is not eligible for Data Snapshots');
            } else {
                gs.info('Data Snapshots InstanceEligibilityJob: Data Snapshots is already disabled, no action performed');
            }
        }
    } catch (e) {
        gs.error('Data Snapshots InstanceEligibilityJob: Error - ' + e);
    }

    function disableAndCreateGaps(reason) {
        gs.info('Data Snapshots InstanceEligibilityJob: Not eligible - disabling Data Snapshots');
        // Create GAPs BEFORE disabling (otherwise active source query returns nothing)
        createGapsForActiveSources(reason);
        // Delegates to DataSnapshotEnablementApi.disableDataSnapshots()
        SNC.EnableMLB.disableDataSnapshots();
        gs.info('Data Snapshots InstanceEligibilityJob: Disabled');
    }

    /**
     * Creates GAPs for all active sources using batch-loaded state data (2 read queries).
     * Delegates to gapsService.endCollection() which handles CDC fact adjustment,
     * data collection disabling, gap record creation, and score invalidation.
     * Calculates endCollectionTime per source type, mirroring EndCollectionEventsProducer.
     */
    function createGapsForActiveSources(reason) {
        // 1. Load all active sources in a single query
        var sources = [];
        var sourceIds = [];
        var sourceGr = new GlideRecord('pa_dm_analytics_source');
        sourceGr.addQuery('is_data_collection_enabled', true);
        sourceGr.query();
        while (sourceGr.next()) {
            var id = sourceGr.getValue('id');
            sources.push({
                id: id,
                frequency: sourceGr.getValue('frequency')
            });
            sourceIds.push(id);
        }
        if (sourceIds.length === 0)
            return;

        // 2. Batch-load all source states in a single query
        var stateMap = {};
        var stateGr = new GlideRecord('pa_dm_source_state');
        stateGr.addQuery('analytics_source', 'IN', sourceIds.join(','));
        stateGr.query();
        while (stateGr.next()) {
            stateMap[stateGr.getValue('analytics_source')] = {
                firstDateTime: stateGr.getValue('first_date_time'),
                lastDeltaDateTime: stateGr.getValue('last_delta_date_time')
            };
        }

        // 3. Calculate endCollectionTime and create gaps via GapsService
        var gapsService = new SNC.GapsService();
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            var state = stateMap[source.id];
            if (!state || !state.firstDateTime || !state.lastDeltaDateTime)
                continue;

            var endTime = (source.frequency === 'all_activity') ?
                getIntradayEndTime(state.lastDeltaDateTime) :
                getDailyEndTime(state.firstDateTime, state.lastDeltaDateTime);

            if (endTime)
                gapsService.endCollection(source.id, endTime, reason);
        }
    }

    /**
     * Intraday: lastDeltaDateTime + 1 second as datetime string.
     * Mirrors EndCollectionEventsProducer.produceEventForIntraDaySource.
     * For all activity sources, GAPS should be created with at least a +1 second difference from the lastDeltaDateTime
     */
    function getIntradayEndTime(lastDeltaDateTime) {
        var gdt = new GlideDateTime(lastDeltaDateTime);
        gdt.addSeconds(1);
        return gdt.getValue();
    }

    /**
     * Daily: next run date as IntegerDate value string (YYYYMMDD).
     * Mirrors CDCTaskUtils.getNextRunDate + EndCollectionEventsProducer.produceEventForDailySource.
     * For daily sources, GAPS should be created with at least a +1 day difference from the lastDeltaDateTime.
     */
    function getDailyEndTime(firstDateTime, lastDeltaDateTime) {
        if (lastDeltaDateTime) {
            // lastDeltaDate + 1 day as IntegerDate
            var gdt = new GlideDateTime(lastDeltaDateTime);
            gdt.addSeconds(86400);
            return toIntegerDateValue(gdt);
        }
        // No previous delta run - use firstDate as IntegerDate
        return toIntegerDateValue(new GlideDateTime(firstDateTime));
    }

    /**
     * Converts a GlideDateTime to IntegerDate value string (YYYYMMDD) in UTC.
     * Equivalent to Java's IntegerDate.getIntegerDateValue().
     */
    function toIntegerDateValue(gdt) {
        var year = parseInt(gdt.getYearUTC());
        var month = parseInt(gdt.getMonthUTC());
        var day = parseInt(gdt.getDayOfMonthUTC());
        return '' + (year * 10000 + month * 100 + day);
    }
})();
