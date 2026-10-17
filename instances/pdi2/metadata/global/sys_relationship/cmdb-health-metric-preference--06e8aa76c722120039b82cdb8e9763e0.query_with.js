(function refineQuery(current, parent) {

	current.addQuery('sys_id', SNC.CMDBUtil.getMetricPrefSysID(parent.name));

})(current, parent);
