var EmPopulateBsBucketMap = Class.create();
EmPopulateBsBucketMap.prototype = {
    initialize: function() {

     },
	
     execute: function() {
         var bucketMapGr = new GlideRecord('em_service_bucket_map');
         bucketMapGr.setLimit(1);
         bucketMapGr.query();

         if (bucketMapGr.getRowCount() === 0) { // Copy records only if 'em_service_bucket_map' table is empty
             this.populateBsBucketMap();
         }
		 // Disable the job after populating the table once, since this population only happens if the table is empty.
         this.disablePopulationScheduledJob();
     },

     populateBsBucketMap: function() {
        gs.info(this.type + " - populate em_service_bucket_map started.");

        var sw = new GlideStopWatch();
        var bulkSize = gs.getProperty("evt_mgmt.bucket_map_batch_size", 500);
        bulkSize = parseInt(bulkSize) || 500;
        var counter = 0;
        var total = 0;
        var batchUtil = new SNC.BatchCommandsUtil();

        // query all operational Business services
        var grCmdbCiServiceAuto = new GlideRecord('cmdb_ci_service_auto');
        grCmdbCiServiceAuto.addQuery("operational_status", 1);
        grCmdbCiServiceAuto.query();

        var jsonArr = [];
        while (grCmdbCiServiceAuto.next()) {
            var jsonObj = {};
            jsonObj.business_service = grCmdbCiServiceAuto.getUniqueValue();
            jsonObj.bucket = grCmdbCiServiceAuto.getValue('bucket');
            jsonArr.push(jsonObj);
            counter++;
            total++;
            if (counter >= bulkSize) {
                batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), 'em_service_bucket_map', '');
                counter = 0;
                jsonArr = [];
            }
        }

        if (counter > 0) {
            //insert rest of records in batch
            batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), 'em_service_bucket_map', '');
        }

        gs.info(this.type + " - populate em_service_bucket_map, updated " + total + " records took " + sw.getTime() + " ms.");
    },

    disablePopulationScheduledJob: function() {
        var scheduledJob = new GlideRecord('sysauto_script');
        var jobExists = scheduledJob.get('657efc0507a60110b34ce06b0fd30025'); // Event management – Populate Buisness Service Bucket Mapping job
        if (jobExists) {
            var commentInScript = '/* This scheduled job was deactivated intentionally after populating em_service_bucket_map table once. Do not activate this job */ \n';
            scheduledJob.setValue('active', 'false');
			scheduledJob.setValue('name', scheduledJob.getValue('name')+ ' - Deactivated');
            scheduledJob.setValue('script', commentInScript + scheduledJob.getValue('script'));
            scheduledJob.update();
        }
    },

    type: 'EmPopulateBsBucketMap'
};
