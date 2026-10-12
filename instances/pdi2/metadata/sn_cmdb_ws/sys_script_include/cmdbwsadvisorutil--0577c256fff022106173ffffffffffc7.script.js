var CMDBWsAdvisorUtil = Class.create();
CMDBWsAdvisorUtil.prototype = {
    initialize: function() {},
    type: 'CMDBWsAdvisorUtil'
};

CMDBWsAdvisorUtil.ADVISOR_SCOPE = "sn_cmdb_advisor";

CMDBWsAdvisorUtil.isAdvisorPluginActive = function() {
    return GlidePluginManager.isActive(CMDBWsAdvisorUtil.ADVISOR_SCOPE);
};

CMDBWsAdvisorUtil.showHomePageEntryPoint = function() {
    //First check if the advisor active, if it is active call Advisor script include for other checks
	return CMDBWsAdvisorUtil.isAdvisorPluginActive() && sn_cmdb_advisor.CMDBAdvisorUtil.showWorkspaceHomePageEntryPoint();
};

CMDBWsAdvisorUtil.showManagementPageEntryPoint = function() {
    //First check if the advisor active, if it is active call Advisor script include for other checks
	return CMDBWsAdvisorUtil.isAdvisorPluginActive() && sn_cmdb_advisor.CMDBAdvisorUtil.showManagementPageEntryPoint();
};
CMDBWsAdvisorUtil.getManagementPageEntryPointLink = function() {
    return sn_cmdb_advisor.CMDBAdvisorUtil.getManagementPageEntryPointLink();
};

CMDBWsAdvisorUtil.isRouteInAdvisorScope = function(route) {
    if (route.startsWith("cmdb-advisor-"))
        return true;
    return false;
};

CMDBWsAdvisorUtil.getAdvisorProvideItems = function(context) {
    try {
        return new sn_cmdb_advisor.CMDBAdvisorNavigationUtil().provideItems(context);
    } catch (e) {
        gs.error("Error in fetching cmdb advisor navigation provideItems:" + e);
        return [];
    }
};
