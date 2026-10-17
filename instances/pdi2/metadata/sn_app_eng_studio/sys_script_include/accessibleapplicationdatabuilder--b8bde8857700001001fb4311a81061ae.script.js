var AccessibleApplicationDataBuilder = Class.create();
AccessibleApplicationDataBuilder.prototype = {
	
    initialize: function() {
		this.accessibleApps = new ApplicationService().getAccessibleAppSysIds();
    },
	
	// removes specific applications stored in the applicationSysIds array from the decoratedApplicationList
	filterOut: function(applicationSysIds) {
		this.accessibleApps = this.accessibleApps.filter(function(appSysId) {
			return this.indexOf(appSysId) < 0;
		}, applicationSysIds);
		
		return this;
	},
	
	
	/** 
	* @return {string[]} of sys_ids of applications that are accessible (IE can be switched into via the scope picker)
	*/
	getAccessibleApps : function() {
		return this.accessibleApps;
	},
	
		// returns application information for the array of application sys_ids passed into the function
	getAccessibleAppsByIds: function(applicationSysIds /*array of strings*/) {
		return this.accessibleApps.filter(function(appSysId) {
			return applicationSysIds.indexOf(appSysId) > -1;
		});
	},
	

    type: 'AccessibleApplicationDataBuilder'
};
