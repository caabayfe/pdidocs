if (pm.isZboot() === false && pm.isActive('com.snc.pa.mlb') === true) {
    gs.log('Executing fix script for adding indicators and status from pa_indicators table pa_indicator_data_snapshot_status table');

    // To get indicator status from existing pa_indicators table
    function getIndicatorStatus() {
        var indicatorListObj = {};
		 var Enabled = '1';
		 var Disabled = '2';
		 var inProgress = '3';
		 var Unsupported = '4';
        var indicatorGr = new GlideRecord('pa_indicators');
        var paCdcUnsupportedReasonsGr = new GlideRecord('pa_cdc_unsupported_reasons');
        indicatorGr.queryNoDomain();
        while (indicatorGr.next()) {
            var indicator_sys_id = indicatorGr.getValue('sys_id');
            var indicator_id = indicatorGr.getValue('id');
            var status = '';
            var is_mlb_enabled = indicatorGr.getValue('is_mlb_enabled');
            var is_mlb_supported = indicatorGr.getValue('is_mlb_supported');

            // status corresponds to: {0: Empty, 1: Enabled, 2: Disabled, 3: In-progress, 4: Unsupported}
            if (is_mlb_enabled == true && is_mlb_supported == true)
                status = Enabled;
            else if (is_mlb_enabled == true && is_mlb_supported == false)
                status = Unsupported;
            else if (is_mlb_enabled == false && is_mlb_supported == true)
                status = Disabled;
            else if (is_mlb_enabled == false && is_mlb_supported == false && paCdcUnsupportedReasonsGr.get('pa_indicator', indicator_id)) {
                status = Unsupported;
             }
			if (status != '')
				indicatorListObj[indicator_sys_id] = status;
        }

        return indicatorListObj;
    }

    //Adding the indicator and status in pa_indicator_data_Snapshot_status table

    function updateStatusPaDataSnapshotStatusTable() {

        var paIndicatorDataSnapshotGr = new GlideRecord('pa_indicator_data_snapshot_status');

        var indicatorListObj = getIndicatorStatus();

        for (var indicator_sys_id in indicatorListObj) {
            paIndicatorDataSnapshotGr.initialize();

            paIndicatorDataSnapshotGr.setValue('indicator', indicator_sys_id);
            paIndicatorDataSnapshotGr.setValue('data_snapshot_status', indicatorListObj[indicator_sys_id]);

            try {
                paIndicatorDataSnapshotGr.insert();
            } catch (e) {
                gs.error('Error inserting record for indicator: ' + indicator_sys_id + '. Error: ' + e.message);
            }

        }

        gs.log('Execution completed for adding indicators and status from pa_indicators table pa_indicator_data_snapshot_status table');
    }

    // Calling this method to update the status in pa_indicator_data_snapshot_status table
    updateStatusPaDataSnapshotStatusTable();
}
