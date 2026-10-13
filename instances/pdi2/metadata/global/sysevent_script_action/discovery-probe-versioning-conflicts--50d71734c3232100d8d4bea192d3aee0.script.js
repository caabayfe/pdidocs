(function() {
    if (event.parm1 != "com.snc.discovery")
        return;

    gs.log("Beginning Probe Conflict Check ...");
    var MAJOR = "major";
    var MINOR = "minor";
    var MAJOR_ERROR_CODE = "302"; // TODO: make ErrorType glide scriptable
    var MINOR_ERROR_CODE = "305";

    var sensor = new GlideRecord('discovery_sensor');
    sensor.query();
    while (sensor.next()) {
        if (sensor.sys_class_name == 'discovery_sensor_multi')
            checkVersionMulti(sensor);
        else
            checkVersionSingle(sensor);
    }

    gs.log("Finished Probe Conflict Check ...");

    // Multiprobe bundle version check
    function checkVersionMulti(multisensor) {
        var dsmp = new GlideRecord('discovery_sensor_multi_probe');
        dsmp.addQuery('parent', multisensor.sys_id);
        dsmp.query();
        while (dsmp.next()) {
            // Get the related probe
            var probe = new GlideRecord("discovery_probes");
            probe.addQuery("sys_id", dsmp.reacts_to_probe);
            probe.query();

            if (!probe.next()) {
                newError("Probe is missing for multisensor " + multisensor.name + " so cannot do version mismatch check")
                return;
            }

            // Check the responding probe script that feeds into the multisensor
            if (dsmp.major_version != multisensor.major_version) {
                var message = "[code]SEVERE ERROR - Version Mismatch: <a href='discovery_sensor_multi.do?sys_id=" + multisensor.sys_id + "'><u>" + multisensor.name + "</u></a> multisensor will not process during discovery because its major version = " + multisensor.major_version + " while " + probe.name + " responding script major version = " + dsmp.major_version + "[/code]";
                newError(message, MAJOR);
            }
            if (dsmp.minor_version != multisensor.minor_version) {
                var message = "[code]Warning - Version Mismatch: <a href='discovery_sensor_multi.do?sys_id=" + multisensor.sys_id + "'><u>" + multisensor.name + "</u></a>\'s multisensor minor version = " + multisensor.minor_version + " while " + probe.name + " responding script minor version = " + dsmp.minor_version + "[/code]";
                newError(message, MINOR);
            }

            // Check probe and the script that responds to it
            if (probe.major_version != dsmp.major_version) {
                var message = "[code]SEVERE ERROR - Version Mismatch: <a href='discovery_sensor_multi.do?sys_id=" + multisensor.sys_id + "'><u>" + multisensor.name + "</u></a> multisensor will not process during discovery because its responding script major version = " + dsmp.major_version + " while its referenced probe " + probe.name + " major version = " + probe.major_version + "[/code]";
                newError(message, MAJOR);
            }

            if (probe.minor_version != dsmp.minor_version) {
                var message = "[code]Warning - Version Mismatch: <a href='discovery_sensor_multi.do?sys_id=" + multisensor.sys_id + "'><u>" + multisensor.name + "</u></a>\'s multisensor responding script minor version = " + dsmp.minor_version + " while its referenced probe " + probe.name + " minor version = " + probe.minor_version + "[/code]";
                newError(message, MINOR);
            }
        }
    }

    // Non-multiprobe probe/sensor check
    function checkVersionSingle(sensor) {
        // Get the related probe
        var probe = new GlideRecord("discovery_probes");
        probe.addQuery("sys_id", sensor.reacts_to_probe);
        probe.query();

        if (!probe.next()) {
            newError("Probe is missing for sensor " + sensor.name + " so cannot do version mismatch check");
            return;
        }

        if (probe.major_version != sensor.major_version) {
            var message = "[code]SEVERE ERROR - Version Mismatch: Probe <a href='discovery_probes.do?sys_id=" + probe.sys_id + "'><u>" + probe.name + "</u></a> will not process during discovery because its major version = " + probe.major_version + " while its related sensor's major version = " + sensor.major_version + "[/code]";
            newError(message, MAJOR);
        }
        if (probe.minor_version != sensor.minor_version) {
            var message = "[code]Warning - Version Mismatch: <a href='discovery_probes.do?sys_id=" + probe.sys_id + "'><u>" + probe.name + "</u></a> probe's minor version = " + probe.minor_version + " while its related sensor's minor version = " + sensor.minor_version + "[/code]";
            newError(message, MINOR);
        }
    }

    function newError(message, type) {
        var error = new GlideRecord('discovery_active_error');
        error.initialize();
        if (type)
            error.result_code = type === MAJOR ? MAJOR_ERROR_CODE : MINOR_ERROR_CODE;
        error.short_message = message;
        error.message = message;
        var helpLink = 'Help link';
        error.help = gs.getMessage('[code]<a href="{0}" target="_blank">{1}</a>[/code]', [SncDiscoveryLogErrorLink.ProbeSensorVersion.getLink(), helpLink]);
        error.insert();
    }
})();
