var CleanupEMBatchMap = Class.create();
CleanupEMBatchMap.prototype = {
    initialize: function() {
    },

runCleanup: function() {
        
        var start = new GlideDateTime().getNumericValue();
        
		var minInUseBatch = new SNC.ImpactManager().getMinInUseBatch();
		
		var keepDataMinutes = new GlideBoundedIntProperty("evt_mgmt.impact_calculation.keep_em_batch_map.minutes", 
													60, 0, 60*24*365*10).getInt();
		minLastDate = new GlideDateTime(); // convert to date
		minLastDate.add(- keepDataMinutes * 60 * 1000); 
		
		var grToCleanUp = new GlideMultipleDelete("em_batch_map");
		grToCleanUp.addQuery("impact_batch", "<", minInUseBatch);
		grToCleanUp.addQuery("vt_start", "<", minLastDate);
		grToCleanUp.execute();
			
		duration = new GlideDateTime().getNumericValue() - start;
		gs.log("Cleanup for em_batch_map deleted batches less than " + minInUseBatch + ". Took " + duration + " msec" );

	
	
	},
    type: 'CleanupEMBatchMap'
	
	

};
