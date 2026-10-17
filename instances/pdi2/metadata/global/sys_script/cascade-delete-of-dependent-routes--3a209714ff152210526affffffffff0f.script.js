(function executeRule(current, previous /*null when async*/) {
	var dependentRouteGR = new GlideRecord('sys_ux_dependent_route');
	var sysId =  current.getUniqueValue();
	if (GlideStringUtil.isEligibleSysID(sysId)) {
		dependentRouteGR.addQuery('dependent_route', sysId);
		dependentRouteGR.query();
		dependentRouteGR.deleteMultiple();
	} 
		
})(current, previous);
