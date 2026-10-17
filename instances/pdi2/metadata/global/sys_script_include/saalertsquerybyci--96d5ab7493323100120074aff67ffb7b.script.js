var SaAlertsQueryByCI = Class.create(); 
SaAlertsQueryByCI.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getQuery: function(filter,bsid,timestamp,pathIds) { 
		
		var filterWithoutMaintenance = new SNC.ImpactManager().filterOutCisByMaintenance(bsid, filter,timestamp,pathIds);
				
		var sysIDs = []; 
		var gr = new GlideRecord('em_alert_history'); 
		var joinQuery = gr.addJoinQuery('cmdb_ci', 'cmdb_ci', 'sys_id' ); 

		joinQuery.addCondition('sys_id', 'IN' , filterWithoutMaintenance); 
		gr.addCondition('vt_start', '<=' , timestamp); 
		gr.addCondition('vt_end', '>' , timestamp); 		
		gr.query(); 
		while (gr.next()) { 
			sysIDs.push(gr.getUniqueValue());
		} 
		var sysids = sysIDs.join(','); 
		return sysids; 
	}, 
    type: 'SaAlertsQueryByCI'
});
