// This script gets run when something gets classified
// g_probe_parameters is an javascript object that contains information that will be turned into probe parameters for the triggered probes.

// Parse the instance name from the parameter -s option (MSSQL 2000 doesn't seem to have it)
// If instance name is successfully parsed, then we update the name, otherwise we leave it as default.
var instance = /\s+\-s(\S+)/.exec(parameters);
var computerName = g_sensor.deviceGR.name;
var processClassiferName = g_classification.name;
if (JSUtil.notNil(instance)) {
    var sqlInstance = instance[1];
    current.name = sqlInstance  + "@" + computerName;
	current.instance_name = sqlInstance;
	g_probe_parameters['sqlInstance'] = sqlInstance;
}

g_probe_parameters['processID'] = g_process.pid;
