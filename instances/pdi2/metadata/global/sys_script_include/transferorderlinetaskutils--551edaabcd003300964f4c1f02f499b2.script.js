var TransferOrderLineTaskUtils = Class.create();
TransferOrderLineTaskUtils.prototype = {
    initialize: function() {
    },

	/*
 	* Description: Used as RefQual for Vendor list in Transfer Order Line Task for Ship,
 	* return Campany list with vendor = true filter
  	*/
	getVendorList : function() {
		
		var coreCompany = new GlideRecord('core_company');
        	coreCompany.addQuery('vendor', true);
		coreCompany.query();
		var result = [];
		while (coreCompany.next()){
		    result.push(coreCompany.sys_id.toString());
		}
		var strQuery = "sys_idIN";
		if (result.length > 0)
		    return strQuery + result.join(",");
		else
		    return strQuery + null;
	},

	/**
	 * Description: Verifies conditions for Close Task UI Action to be visible
	 */
	canCloseTask : function(obj) {
		return (obj.getValue('state') !== '3' && obj.getValue('state') !== '7') && (gs.hasRole('itil') || gs.hasRole('inventory_user') || gs.hasRole('sn_request_write') || gs.hasRole('sn_change_write') || gs.hasRole('sn_problem_write') || gs.hasRole('sn_incident_write'));
	},

	/**
	 * Description: Verifies conditions for Close Subtask UI Action to be visible
	 */
	canCloseSubtask : function(obj){
		return (obj.getValue('state') !== '3' && obj.getValue('state') !== '7') && (gs.hasRole('itil') || gs.hasRole('inventory_user') || gs.hasRole('sn_request_write') || gs.hasRole('sn_change_write') || gs.hasRole('sn_problem_write') || gs.hasRole('sn_incident_write'));
	},
	
    type: 'TransferOrderLineTaskUtils'
};
