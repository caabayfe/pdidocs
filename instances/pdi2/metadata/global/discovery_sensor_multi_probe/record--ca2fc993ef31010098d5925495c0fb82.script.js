/* This script parses the active connection info from windows
*
* Example of Windows active connections
Proto  Local Address          Foreign Address        State           PID
TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       732
TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
TCP    0.0.0.0:3308           0.0.0.0:0              LISTENING       1540
TCP    0.0.0.0:49157          0.0.0.0:0              LISTENING       480
TCP    127.0.0.1:445          127.0.0.1:54892        ESTABLISHED     4
TCP    127.0.0.1:31000        127.0.0.1:32000        ESTABLISHED     1736
TCP    127.0.0.1:31001        127.0.0.1:32001        ESTABLISHED     3176
TCP    172.20.27.54:80        192.168.32.164:13187   TIME_WAIT       0
TCP    172.20.27.54:80        192.168.32.164:13194   TIME_WAIT       0
TCP    172.20.27.54:80        192.168.32.164:13199   TIME_WAIT       0
...
*
*  aleck.lin@servicenow.com
*/

function(result, ciData, debug, sensor) {
	var connections = [];
	var otherStates = [];
	var lines = result.output.split(/\n/);

	this.errorManager = new SNC.DiscoveryErrorManager();

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();

		if (line.length == 4)
			continue;

		var parts = line.split(/\s+/);
		if (parts.length < 5 || parts[0] != "TCP" || gs.nil(parts[3]))
			continue;

		var local = parts[1];
		var localIP = "";
		var localPort = "";
		if(local.indexOf('[') < 0) {
			//IPV4 Address
			localIP = local.split(":")[0];
			localPort = local.split(":")[1];
		} else {
			//IPV6 Address
			//We are parsing for [IPV6]:PORT format which is returned from netstat, the RFC format is not guaranteed https://datatracker.ietf.org/doc/html/rfc5952#section-6
			var localIPv6Parts = /\[([^\]]+)\]:([0-9]+)/.exec(local);
			localPort = localIPv6Parts[2];
			localIP = localIPv6Parts[1];
		}

		var remote = parts[2];
		var remoteIP = "";
		var remotePort = "";
		if(remote.indexOf('[') < 0) {
			//IPV4 Address
			remoteIP = remote.split(":")[0];
			remotePort = remote.split(":")[1];
		} else {
			//IPV6 Address
			var remoteIPv6Parts = /\[([^\]]+)\]:([0-9]+)/.exec(remote);
			remotePort = remoteIPv6Parts[2];
			remoteIP = remoteIPv6Parts[1];
		}

		var state = parts[3];
		var pid = parts[4];

		var establishedTcpStates = gs.getProperty('glide.discovery.windows_tcp_established_connections',[]).split("|");
		var listeningTcpStates = gs.getProperty('glide.discovery.windows_tcp_listening_connections',[]).split("|");

		var connection =  {};

		// Now perform the comparison
		if (listeningTcpStates.indexOf(state) > -1) {
			connection.type = "on";
			connection.ip = localIP;
			connection.port = localPort;
			connection.pid = pid;
		} else if (establishedTcpStates.indexOf(state) > -1) {
			connection.type = "to";
			connection.ip = remoteIP;
			connection.port = remotePort;
			connection.pid = pid;
			connection.local_ip = localIP;
			connection.local_port = localPort;
		} else if(otherStates.indexOf(state) === -1){
			otherStates.push(state);
		}
		if(Object.keys(connection).length > 0)
			connections.push(connection);
	}

	if (otherStates.length > 0) {
		if (connections.length === 0) {
			var errorParams = {
				code: 'SN-5702',
				key: g_probe.getParameter('source'),
				contextMap: {
					ip_address: g_probe.getParameter('source'),
					device_class: null
				},
				message: 'Unable to find TCP connections due to potential non-English language settings',
				ci: g_probe.getParameter('ci_sys_id')
			};

			DiscoveryErrorsUtilities.addError(errorParams);
		} else {
			DiscoveryLogger.warn('Other TCP connection states found: ' + JSON.stringify(otherStates));
		}
	}
	sensor.connections = connections;
}
