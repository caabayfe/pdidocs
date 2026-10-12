/* This script parses the active connection info from linux
 *
 * Example of linux active connections

Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name
tcp        0      0 127.0.0.1:2208              0.0.0.0:*                   LISTEN      2261/hpiod
tcp        0      0 0.0.0.0:111                 0.0.0.0:*                   LISTEN      2038/portmap
tcp        0      0 0.0.0.0:977                 0.0.0.0:*                   LISTEN      2067/rpc.statd
tcp        0      0 127.0.0.1:2207              0.0.0.0:*                   LISTEN      2266/python
tcp        0      0 10.196.39.213:111           10.255.31.44:699            ESTABLISHED 2038/portmap
tcp        1      0 10.196.39.213:1850          10.196.39.217:9082          CLOSE_WAIT  1327/httpd
...
 */

var DiscoveryNetstatParser = Class.create();
DiscoveryNetstatParser.prototype = {
	initialize: function() {
	},
	
	parse: function(output) {
		this.tcp = [];
		this.isValid = true;
		this.errorString = '';
		
		var lines = output.split(/\n/);
		
		for (var i = 0; i < lines.length; i++) {
			
			var line = lines[i];
			
			if (JSUtil.nil(line)) {
				if (i != lines.length - 1)
					this.error('Empty line in netstat output, line: ' + (i + 1));
				continue;
			}
			
			var parts = line.split(/\s+/);
			if (parts.length < 7 || !parts[0].startsWith("tcp"))
				continue;
			
			var local = parts[3];
			if(JSUtil.nil(local))
				continue;
			
			if(local.toLowerCase().indexOf("::ffff:") === 0)
				local = local.substring(7);
			
			var ipPortMap = this.parseAddress(local);
			if(ipPortMap == null)
				continue;
			var localIP = ipPortMap["ip"];
			var localPort = ipPortMap["port"];
			
			var remote = parts[4];
			if(JSUtil.nil(remote) && (state == "ESTABLISHED" || state == "TIME_WAIT" || state == "CLOSE_WAIT"))
				continue;
			
			if(!JSUtil.nil(remote) && remote.toLowerCase().indexOf("::ffff:") === 0)
				remote = remote.substring(7);
			
			var remoteIP = remote.split(":")[0];
			var remotePort = remote.split(":")[1];
			
			var state = parts[5];
			if(JSUtil.nil(state))
				continue;
			
			var pidProg = parts[6];
			if(JSUtil.nil(pidProg))
				continue;
			var pid = parseInt(pidProg.split("/")[0]);
			if (isNaN(pid)) {
				this.error('Invalid PID: ' + pid);
				continue;
			}
			else
				pid = ""+pid;
			
			var connection =  {};
			if (state == "LISTEN") {
				connection.type = "on";
				connection.ip = localIP;
				connection.port = localPort;
				connection.pid = pid;
				this.tcp.push(connection);
			} else if (state == "ESTABLISHED" || state == "TIME_WAIT" || state == "CLOSE_WAIT") {
				connection.type = "to";
				connection.ip = remoteIP;
				connection.port = remotePort;
				connection.pid = pid;
				connection.local_ip = localIP;
				connection.local_port = localPort;
				this.tcp.push(connection);
			}
		}
		
	},
	
	parseAddress: function(address){
		var ip;
		var port;
		
		var parts = /([^\]]+):([0-9]+)/.exec(address);
		if(!parts || parts.length != 3)
			return null;
		
		port = Number(parts[2]);
		if (isNaN(port))
			return null;
		else
			port = ""+port;
		
		if(parts[1] == "::1")
			ip = "127.0.0.1";
		else {
			ip = parts[1];
			
			if (parts[1] == '*' || !SncIPAddressV4.getIPAddressV4Instance(parts[1]) || parts[1] == "::")
				ip = '0.0.0.0';
		}
		
		if(!ip || !port)
			return null;
		
		var ipPortMap = {};
		ipPortMap["ip"] = ip;
		ipPortMap["port"] = port;
		return ipPortMap;
		
	},
	
	error: function(msg) {
		this.isValid = false;
		if (!JSUtil.nil(this.errorString))
			this.errorString += '\n';
		this.errorString += msg;
	},
	
	getConnections: function(){
		return JSON.stringify(this.tcp);
	},
	
	getError: function(){
		return this.errorString;
	},
	
	getIsValid: function(){
		return this.isValid;
	},
	
	type: 'DiscoveryNetstatParser'
};
