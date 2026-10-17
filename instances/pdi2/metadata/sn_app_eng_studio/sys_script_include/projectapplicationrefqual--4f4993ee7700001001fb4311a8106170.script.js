var ProjectApplicationRefQual = (function() {
	return {
		getSuitableApplicationSysIds: function() {
			var appData = new AccessibleApplicationDataBuilder().filterOut([CreatorStudioConstants.GLOBAL_APPLICATION_SYS_ID]).getAccessibleApps();
			
			return appData;
		}
	};
})();
