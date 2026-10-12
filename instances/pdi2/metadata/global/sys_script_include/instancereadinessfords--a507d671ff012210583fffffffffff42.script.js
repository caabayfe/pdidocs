var InstanceReadinessForDS = Class.create();
InstanceReadinessForDS.prototype = {
    initialize: function() {},

    enableDatasnapshots: function() {
        gs.log("Enabling Data snapshots");
        //check if db is raptor pro.
        try {
            if (!SNC.EnableMLB.isRaptorStandard()) {
                enableGlobalProperty();
                disableReplicationStatus();
                enableMiningJobs();
                enableConversionJobs();
                enableBusinessRules();
                enableCleanupJobs();
                enableTableCleanerJobs();
                gs.log("Data snapshots is enabled");
            } else {
                gs.log("DataSnapshots is not supported for Raptor standard database");
            }
        } catch (e) {
            gs.logError("Error enabling Data snapshots: " + e.message);
        }

        function enableGlobalProperty() {
            var dbQuery = new GlideDBQuery("sys_properties");
            dbQuery.addQuery("name", "com.snc.pa.dm.enable.mlb");
            var dbu = new GlideDBUpdate("sys_properties");
            dbu.setQuery(dbQuery);
            dbu.setValue("value", "true");
            dbu.setMultiple(true);
            dbu.execute();
            dbu.close();
            dbQuery.close();
        }

        function enableMiningJobs() {
            var jobIds = [
                '3b35e9054300121091d000a09fb8f261', // First snapshot
                '079dbd16770230101b512608c8106195', // Incremental daily snapshot
                '1d996a38ff322210a3bbffffffffffe7' // Incremental all changes snapshot
            ];

            var miningJobsGr = new GlideRecord("sysauto_dm_cdc_collector");
            miningJobsGr.addQuery('sys_id', 'IN', jobIds);
            miningJobsGr.query();
            while (miningJobsGr.next()) {
                miningJobsGr.setValue("active", true);
                miningJobsGr.setValue("kill_job", false);
                miningJobsGr.update();
            }
        }

        function disableReplicationStatus() {
            GlidePropertiesDB.set("com.snc.pa.replication.status", false);
        }

        function enableConversionJobs() {
            var jobIds = [
                '82dd33c943dd71508060c4d05fb8f2df', // Indicator to Data Snapshots Conversion
                'f12658b8ff002210583fffffffffffb9' // Indicator Data Snapshot status update
            ];
            var sysautoGr = new GlideRecord("sysauto");
            sysautoGr.addQuery("sys_id", "IN", jobIds);
            sysautoGr.query();
            while (sysautoGr.next()) {
                sysautoGr.setValue("active", true);
                sysautoGr.update();
            }
        }

        function enableBusinessRules() {
            var businessRuleSysIds = [
                'f6f3e79293110210ff43ac29848918e4', //PA ULB Conversion on Enable [Indicator [pa_indicators]]
                '2cf9f8d9ffa02210583fffffffffffcf', //Real time conversion for indicators [Breakdown Mapping [pa_breakdown_mappings]]
                '615c4a0d37a02210583f5a9be2924bca', //Real time conversion for indicators [Scheduled Data Collection [sysauto_pa]]
                '64ab3ec1ff202210583fffffffffffb3', //Real time conversion for indicators [Job Indicator [pa_job_indicators]]
                '8df67f1cff002210583fffffffffffb0', //Real time conversion for indicators [Indicator Source [pa_cubes]]
                '8f771805ff102210583fffffffffffba', //Real time conversion for indicators [Indicator [pa_indicators]]
                'b9452ebcffa42210583fffffffffff7f', //Real time conversion for indicators [Report Source [sys_report_source]]
                '4b7528ed37202210583f5a9be2924bb0'  //Real time for breakdowns and jobs [Indicator [pa_indicators]]
            ];
            var sysscriptGr = new GlideRecord("sys_script");
            sysscriptGr.addQuery("sys_id", "IN", businessRuleSysIds);
            sysscriptGr.query();
            while (sysscriptGr.next()) {
                sysscriptGr.setValue("active", true);
                sysscriptGr.update();
            }
        }

        function enableCleanupJobs() {
            var cleanerJobSysIds = [
                '90d53514ff103210e861ffffffffff4b', //PADatasnapshotThresholdCleanup
                '3f718548ff103210e861ffffffffff13', //PADatasnapshotTargetsCleanup
                'c9b5eb2753d43210e86146e980f7b434', //PADatasnapshotPersonalThresholdCleanup
                '21d45de55b601110b0703a543381c71b' //PA CDCFlatTableCleaner
            ];
            var sysautoGr = new GlideRecord("sysauto");
            sysautoGr.addQuery("sys_id", "IN", cleanerJobSysIds);
            sysautoGr.query();
            while (sysautoGr.next()) {
                sysautoGr.setValue("active", true);
                sysautoGr.update();
            }
        }

        function enableTableCleanerJobs() {
            var tableCleanerJobSysIds = [
                '11aa4b019f411210866a62198a0a1cb4', //pa_cdc_transfer_changes_performance
                '47ed1cf453313010b41dddeeff7b12ad', //pa_dm_delta_changes
                '6210c824ff202210583fffffffffff45' //pa_dm_delta_task_state
            ];
            var sysautoflushGr = new GlideRecord("sys_auto_flush");
            sysautoflushGr.addQuery("sys_id", "IN", tableCleanerJobSysIds);
            sysautoflushGr.query();
            while (sysautoflushGr.next()) {
                sysautoflushGr.setValue("active", true);
                sysautoflushGr.update();
            }
        }
    },

    type: 'InstanceReadinessForDS'
};
