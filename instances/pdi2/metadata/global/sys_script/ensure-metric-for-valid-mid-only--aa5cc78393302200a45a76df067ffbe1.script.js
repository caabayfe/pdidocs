function onBefore(current, previous) {
	var conUtil = new ConnectorUtil();
	var kpiMid = conUtil.findValidAgentForMetricCollection(current);

	if (gs.nil(kpiMid)) {
		current.kpi = false;
		gs.addErrorMessage(gs.getMessage("Can not find a MID Server to use for Metric Collection. "));
	}
}
   
