var gr = new GlideRecord("ecc_queue");
gr.initialize();
gr.setValue("topic", "MetricIntelligenceStatsProbe");
gr.setValue("queue", "output");
gr.setValue("state", "ready");
gr.setValue("agent", "mid.server." + current.getValue("name"));
var eccQueueOutputRecordSysId = gr.insert();

if (gs.nil(eccQueueOutputRecordSysId)) {
    var errMsg = gr.getLastErrorMessage();
    if (gs.nil(errMsg))
        gs.addErrorMessage(gs.getMessage("Error creating MetricIntelligenceStatsProbe"));
    else
        gs.addErrorMessage(gs.getMessage("Error creating MetricIntelligenceStatsProbe: {0}", errMsg));
} else {
    gs.addInfoMessage(gs.getMessage("Grabbing Metric Intelligence Statistics"));
    action.setRedirectURL("ecc_queue_list.do?sysparm_query=response_to%3D" + eccQueueOutputRecordSysId);
}
