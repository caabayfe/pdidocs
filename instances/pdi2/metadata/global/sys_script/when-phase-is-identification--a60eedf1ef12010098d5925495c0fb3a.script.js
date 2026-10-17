/**
 Service-now.com
 
 Description: 
 1. If there's already discovery classifier probe that is of the "identification" phase, then we shouldn't allow another one.
 2. For process classifier, we'd never add a classifier probe that is of "identification" phase
**/

(function() {
		
	(function() {
		var gr = new GlideRecord("discovery_classifier_probe");
		gr.addQuery("classy", current.classy);
        gr.addQuery("phase", "identification");
        gr.addQuery("sys_domain", current.sys_domain);
		gr.addQuery("sys_id", "!=", current.sys_id);
		gr.addActiveQuery();
		gr.query();
		if (!gr.next())
			return;
			
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Failed to insert identity probe. Only one Identity probe can be active at any time'));
	})();
		
	(function() {	
		if (current.classy.sys_class_name != "discovery_classy_proc")
			return;
		
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Identification probes cannot be added as a process classifier probe'));
	})();	
})();
