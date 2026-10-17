var EvtMgmtBsBucketMapUtils = Class.create();
EvtMgmtBsBucketMapUtils.prototype = {
    initialize: function() {

    },

    // Go over the em_service_bucket_map table and delete from the table BS's that
    // where deleted or thier status isn't operational
    syncBucketMapping: function() {
		var sw = new GlideStopWatch();
        var counter = 0;
        var deletedSysIds = [];
        var gr = new GlideRecord('em_service_bucket_map');
        gr.query();
        while (gr.next()) {
            var bsId = gr.getValue('business_service');
            if (gs.nil(bsId)) { // if bsId is empty the BS was deleted.
                deletedSysIds.push(gr.getUniqueValue());
                gr.deleteRecord();
                counter++;
            } else {
                var grCmdbCiServiceAuto = new GlideRecord('cmdb_ci_service_auto');
                var bsExists = grCmdbCiServiceAuto.get(bsId);
                // delete the record if the BS isn't found or if the status of the BS isn't operational
                if (!bsExists || grCmdbCiServiceAuto.getValue("operational_status") != '1') {
                    deletedSysIds.push(gr.getUniqueValue());
                    gr.deleteRecord();
                    counter++;
                }
            }
        }
        var log = "Event management – sync bucket mapping: deleted " + counter + " records of non-operatinal buisness services from em_service_bucket_map. Total time for job to run : "+ sw.getTime() + " ms. \n";
        if (counter != 0) {
            log += "SysId of deleted records: [" + deletedSysIds + "] \n";
        }
        gs.info(log);
    },

    type: 'EvtMgmtBsBucketMapUtils'
};
