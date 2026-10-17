var FixImpactGraphHistoryUpdateTime = Class.create();
FixImpactGraphHistoryUpdateTime.prototype = {
    initialize: function() {
    },

	// Go over the em_impact_graph_history table and check for BS's that
	// their time_mili is larger then X days ago and have no more updated entry in the X range of days
	// * We check for time_mili field (and not sys_updated_on) since the table has no index on sys_update_on
	// but do have one on time_mili (time_mili and sys_updated_on columns assumed to be correlated)
	// * We collect all BS and not work on each one once we found it since we need to change its sys_update_on and 
	// we don't want to do it while we are processing the table

	checkDates : function (numOfDays) {
		var dateOffset = (24*60*60*1000) * numOfDays; 
		var startDate = new GlideDateTime();
		startDate.subtract(dateOffset);

		var bsArr = [];
		var agg = new GlideAggregate('em_impact_graph_history');
		agg.groupBy("business_service");
		agg.addAggregate("MAX",'time_mili');
		agg.addHaving('MAX', 'time_mili','<', startDate.getNumericValue());

		agg.query();
		while (agg.next()) {
			var business_service = agg.getDisplayValue('business_service');
			bsArr.push(agg.getValue('business_service'));
		}
		this.updateLastDate(bsArr, startDate);
	},
	
	// Change the sys_updated_on of the latest entry in em_impact_graph_history on the BS's array
	updateLastDate : function (records, startDate) {
		var nowDate = new GlideDateTime();
		for(i = 0; i < records.length; i++) {
			var gc = new GlideRecord('em_impact_graph_history');
			gc.addQuery('business_service', records[i]);
			gc.orderByDesc('time_mili');
			gc.setLimit(1);
			gc.query();
			
			while (gc.next()) {
				var business_service = gc.getDisplayValue('business_service');
				var sys_updated_on = gc.getValue('sys_updated_on');
				if(this.verifySysUpdateOn(sys_updated_on, startDate)){
					gs.info("FixImpactGraphHistoryUpdateTime: Updated sys_update_on of Business Service: {0} from {1} to {2}",[business_service, sys_updated_on, nowDate]);
					gc.setValue('sys_updated_on',nowDate);
					gc.update();
				}
				
			}
		}	
	},
	
	// verify that the sys_updated_on is indeed older then the time range checked
	verifySysUpdateOn : function(sys_updated_on, startDate){
		if(sys_updated_on < startDate){
			return true;
		}
		return false;
	},
	
    type: 'FixImpactGraphHistoryUpdateTime'
};
