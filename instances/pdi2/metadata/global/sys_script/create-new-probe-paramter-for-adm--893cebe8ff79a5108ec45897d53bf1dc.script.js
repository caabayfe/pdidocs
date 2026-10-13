(function executeRule(current, previous /*null when async*/ ) {
    var PROBE_PARAM_NAME = 'running_process_filter';
    var probe = current.probe;
    var valueScript = "var g = new GetDiscoverySchedulerConfigPerProbe();answer = g.getConfig(%s, g_probe.getCorrelator());";

    createNewProbeParameter(probe);

    function createNewProbeParameter(probe) {
        valueScript = valueScript.replace('%s', "'" + probe + "'");
        var probeParameterGr = new GlideRecord('discovery_probe_parameter');
        probeParameterGr.addQuery('probe', probe);
        probeParameterGr.addQuery('name', PROBE_PARAM_NAME);
        probeParameterGr.query();

        if (probeParameterGr.next()) {
            probeParameterGr.setValue('active', true);
            probeParameterGr.setValue('value_script', valueScript);
            probeParameterGr.update();
        } else {
            probeParameterGr.initialize();
            probeParameterGr.setValue('active', true);
            probeParameterGr.setValue('probe', probe);
            probeParameterGr.setValue('name', PROBE_PARAM_NAME);
            probeParameterGr.setValue('value_script', valueScript);
            probeParameterGr.insert();
        }
    }

})(current, previous);
