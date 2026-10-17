
var maasEnabled = gs.getProperty('mid.otel.export.maas.enabled');
if (maasEnabled === null || maasEnabled === 'true') {
    try {
        new SNC.SendMetricsHandler().sendMetrics(event.parm1);
    } catch (e) {
        gs.warn("Error sending metric data for MID Server: " + event.parm2, e);
    }
}

var gr = new GlideRecordSecure('ecc_agent_telemetry');
gr.addQuery('sys_id', event.parm1);
gr.setLimit(1);
gr.query();
gr.next();
if (gr.isValidRecord()) {
    gr.deleteRecord();
}
