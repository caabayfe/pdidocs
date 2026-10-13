var EmBucketCalculator = Class.create();
EmBucketCalculator.prototype = {
    initialize: function() {
    },
	
	calculateBucketByClassName: function(className, name){
		if(name === null || name === '')
			name = "default";

		if(className == "cmdb_ci_alert_group") {
			return -2;
		} else {
			var maxBucket = gs.getProperty("evt_mgmt.impact.bucket_count", 4);
			return SNC.EventManagementScriptableApis.calculateBucketWithLimit(name, maxBucket);
		}
	},
		
	calculateBucket: function(glideRecord) {
		return this.calculateBucketByClassName(glideRecord.getValue("sys_class_name"), glideRecord.getValue("name"));
	},
		
    type: 'EmBucketCalculator'
};
