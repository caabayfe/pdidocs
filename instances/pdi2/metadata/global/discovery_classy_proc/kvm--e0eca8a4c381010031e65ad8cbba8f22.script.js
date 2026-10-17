// This script gets run when something gets classified
current.ip_address = source;
var linuxGr = g_sensor.getCmdbRecord();
if(linuxGr)
	current.linux_host = linuxGr.getUniqueValue();
