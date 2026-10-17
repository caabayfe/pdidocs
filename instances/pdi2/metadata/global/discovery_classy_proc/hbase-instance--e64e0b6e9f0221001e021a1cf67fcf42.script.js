// This script gets run when something gets classified

// only supports default ports by the Cloudera/Apache distributions
var matches = g_process.listening_on.match(/.*:(60000|60020|16000|16020):.*/);
if (matches)
	current.tcp_port = matches[1];

// file name with space not included
var matches = parameters.match(/hbase.home.dir=([0-9a-zA-Z_\-\.\/]+)/);
if (matches) {
    current.hbase_home = matches[1];
	// used by probe: HBase - Version
	g_probe_parameters['hbase_home'] = current.hbase_home;
}

// used by probe: HBase - Main Class
g_probe_parameters['processID'] = g_process.pid;
var computerName = g_sensor.deviceGR.name;
g_probe_parameters['computerName'] = !gs.nil(computerName)? computerName : g_sensor.deviceGR.ip_address;

// change instance name to indicate HMaster/RegionServer status
// works only if ps command returns full cmdline
var matches = parameters.match(/ ([^ ]+) start$/);
if (matches) {
	var mainClass = matches[1];
	var shortName = mainClass.substring( mainClass.lastIndexOf('.') + 1);
	current.name = shortName + '@' + g_probe_parameters['computerName'];
}
