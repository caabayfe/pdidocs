var IsSLAConfigurationOverpopulated = Class.create();
IsSLAConfigurationOverpopulated.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'IsSLAConfigurationOverpopulated',
	
	getErrorMessage: function() {
	    if (!gs.hasRole('evt_mgmt_operator')){
	      gs.error("Failed to check SLA configuration filter limit size: acl check has failed");
	      return '';
	    }

		var slaConfSysId = this.getParameter('sla_conf_sys_id');
	    var slaConfm = new SNC.SlaConfigurationManager();
		var err = slaConfm.getErrorMessageIfTooManyElements(slaConfSysId);
		return err;
	}
});
