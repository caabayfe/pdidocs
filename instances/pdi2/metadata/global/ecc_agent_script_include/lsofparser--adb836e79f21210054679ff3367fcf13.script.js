// Discovery class

/**
 * Parses output of the following command:
 *     lsof -i4TCP -n -P -F pcnfT
 * 
 * author tom.dilatush@service-now.com
 */
var LSOFParser = Class.create();

LSOFParser.prototype = {
    /**
     * Parse the given lsof output.  Results are in tcp[], each element of which is an object with the following fields:
     *   pid: process ID
     *   type: "on" or "to" for listening on or connecting to, respectively
     *   ip: the IP address we're listening on or connecting to (depending on type)
     *   port: the port we're listening on or connecting to (depending on type)
     *   local_ip: the local IP address we're connecting from (undefined if listening on)
     *   local_port: the local port we're connecting from (undefined if listening on)
     *   
     *   Errors are recorded in the error string if the isValid is false.
     */
    parse: function(output) {
        this.initProcess();
        this.errorString = '';
        this.tcp = [];
        this.isValid = true;
        var lines = output.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (JSUtil.nil(line)) {
                if (i != lines.length - 1)
                    this.error('Empty line in lsof output, line: ' + (i + 1));
                continue;
            }
			
            var prefix = line.substring(0, 1);
            var eventHandler = 'on_' + prefix;
            if (this[eventHandler])
                this[eventHandler](line.substring(1));
            else
                this.error('Bad line in lsof output, line '+(i+1)+':\n'+line);
        }
        this.on_endProcess();
    },

    on_p: function(line) {
        var pid = new Number(line);
        if (isNaN(pid)) {
            this.error('Invalid PID: ' + line);
            return;
        }
        this.on_endProcess();
        this.currentPID = ''+pid;
    },

    on_c: function(line) {
        if (JSUtil.nil(line)) {
            this.error('Empty command');
            return;
        }
        this.currentCmd = line;
    },

    on_f: function(line) {
		var fd = new Number(line);
		//if there's more than 10000 file descriptors, lsof replaces higher digits with "*"
		if(line[0] == "*") {
			if(!this.lastPrefix)
				this.lastPrefix = 10;
			
			if(this.lastSuffix == '999')
				this.lastPrefix++;
			
			this.lastSuffix = line.substring(1);
			fd = new Number(''+this.lastPrefix+this.lastSuffix);
		}
        
        if (isNaN(fd)) {
            this.error('Invalid file descriptor: ' + line);
            return;
        }
        this.on_endFileDescriptor();
        this.currentFD = line;
    },

    on_n: function(line) {
        this.currentAddress = line;
    },

    on_T: function(line) {
        var parts = line.split('ST=');
        if ((parts.length != 2) || (parts[0] != ''))
            return;

        this.currentState = parts[1];
    },

    on_endFileDescriptor: function() {
        if (!this.currentFD)
            return;

		//Sometimes we get entries like this. The connection is closed. Skip it.
		//n*:*
		//TST=CLOSED		
		if (this.currentState == 'CLOSED')
			return;
		
        var isListening = (this.currentState == 'LISTEN');
        if (!this.currentPID) {
            this.error('Missing PID on file descriptor ' + this.currentFD);
            return;
        }
        if (!this.currentAddress) {
            this.error('Missing address on PID ' + this.currentPID + ', file descriptor ' + this.currentFD);
            return;
        }
        
        // parse the connection data to get the bits we want...
        var result = {};
        result.type = isListening ? 'on' : 'to';
        result.pid = this.currentPID;
        var parsedIP = null;
        var parsedLocalIP = null;
        if (isListening)
            parsedIP = this.parse_connection(this.currentAddress);
        else {
            var parts = this.currentAddress.split('->');
            parsedIP = this.parse_connection(parts[1]);
            parsedLocalIP = this.parse_connection(parts[0]);
			//Need to properly parse both sides for a valid connection
			if(parsedIP == null || parsedLocalIP == null)
				return;
        }
        if (parsedIP == null) {
            this.error('Connection address and port is not parseable: ' + this.currentAddress);
            return;
        }

        result.ip = parsedIP.ip;
        result.port = ''+parsedIP.port;
        if (parsedLocalIP != null) {
            result.local_ip = parsedLocalIP.ip;
            result.local_port = parsedLocalIP.port;
        }
        
        this.tcp.push(result);
        
        this.initFileDescriptor();
    },
    
    /**
     * Returns an object with an ip and port fields, which are parsed from the given string.  If the 
     * IP addresss section of the given string is not a valid IP address, it is replaced with 0.0.0.0.
     * Returns null on any parsing error.
     */
    parse_connection: function(str) {
        if (!str)
            return null;
        
        var result = {};
		if(str.indexOf('[') < 0) { // not an IPv6 address
			var parts = str.split(':');
			if (parts.length != 2)
				return null;
			
			result.port = Number(parts[1]);
			if (isNaN(result.port))
				return null;
			
			result.ip = parts[0];
			if (parts[0] == '*' || !SncIPAddressV4.getIPAddressV4Instance(parts[0]))
				result.ip = '0.0.0.0';
		}
		else { //tis IPv6
			var parts = /\[([^\]]+)\]:([0-9]+)/.exec(str);
			if(!parts || parts.length != 3)
				return null;
			
			result.port = Number(parts[2]);
			if (isNaN(result.port))
				return null;
			result.ip = parts[1];
		}
        return result;
    },

    on_endProcess: function() {
        if (!this.currentPID)
            return;

        this.on_endFileDescriptor();
        this.initProcess();
    },

    initProcess: function() {
        this.currentPID = null;
        this.currentCmd = null;
        this.initFileDescriptor();
    },

    initFileDescriptor: function() {
        this.currentFD = null;
        this.currentAddress = null;
        this.currentState = null;
    },

    error: function(msg) {
        this.isValid = false;
        if (!JSUtil.nil(this.errorString))
            this.errorString += '\n';
        this.errorString += msg;
    },

    type: "LSOFParser"
}
