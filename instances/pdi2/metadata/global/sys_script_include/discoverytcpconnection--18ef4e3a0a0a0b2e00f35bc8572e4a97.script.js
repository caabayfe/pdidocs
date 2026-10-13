var DiscoveryTCPConnection = Class.create();

DiscoveryTCPConnection.prototype = {
  initialize : function() {
      this.pid = "";
      this.command = "";
      this.fromHost = "";
      this.fromPort = "";
      this.toHost = "";
      this.toPort = "";
      this.listening = true;
  },

  setConnection: function(connectStr) {
      if (gs.nil(connectStr))
          return;

      // multi connect will be  host:port->host:port
      if (connectStr.indexOf("->") > -1) {
          var parts = connectStr.split(/->/);

          var s = parts[0];
          var hp = this.getHostPort(s);
          this.setFrom(hp[0], hp[1]);

          s = parts[1];
          hp = this.getHostPort(s);
          this.setTo(hp[0], hp[1]);
      } else {
          // single connection will be host:port
          var hp = this.getHostPort(connectStr);
          this.setFrom(hp[0], hp[1]);
      }
  },

  /*
   * Parse a string and return a String[] with
   * 0 being host and 1 being port.
   * 
   * Sometimes the host/port combo can look like
   * host:port
   * [::host]:port
   */
  getHostPort: function(hostPort) {
      var lastCall = hostPort.lastIndexOf(':');
      var hostAddr = hostPort.substring(0, lastCall);
      var portNumb = hostPort.substring(lastCall+1);
        
      // format is [::<hostAddr]
      if (hostAddr.startsWith("[") && hostAddr.endsWith("]")) {
          hostAddr = hostAddr.substring(0, hostAddr.length - 1);
          var a = hostAddr.split(":");
          hostAddr = a[a.length - 1];
      }
        
      return [ hostAddr, portNumb ];
  },

  setPID: function(pid) {
      this.pid = pid;
  },

  getPID: function() {
      return this.pid;
  },

  setCommand: function(cmd) {
      this.command = cmd;
  },

  getCommand: function() {
      return this.command;
  },

  setFrom: function(hostname, portname) {
      if (gs.nil(hostname) || hostname == "0.0.0.0")
          hostname = "*";

      if ("1".equals(hostname))
          hostname = "127.0.0.1";

      this.fromHost = hostname;
      this.fromPort = portname;
  },

  getFromHost: function() {
      return this.fromHost;
  },

  getFromPort: function() {
      return this.fromPort;
  },

  setTo: function(hostname, portname) {
      this.toHost = hostname;
      this.toPort = portname;
        
      // if we have a peer -- this is a connect, not a listen
      this.setListening(false);
  },

  getToHost: function() {
      return this.toHost;
  },

  getToPort: function() {
      return this.toPort;
  },

  isListening: function() {
      return this.listening;
  },

  setListening: function(b) {
      this.listening = b;
  },

  /*
   * isValid -- return false if we dont have a from host or from port.. We should
   * always have that.
   */
  isValid: function() {
      return !gs.nil(this.getFromHost()) && !gs.nil(this.getFromPort());
  },

  isValidConnection: function() {
      return this.isValid() && !gs.nil(this.getToHost()) && !gs.nil(this.getToPort());
  },

  toString: function() {
      var connectionStr = this.getFromHost() + ":" + this.getFromPort();

      if (!this.isListening())
          connectionStr += "->" + this.getToHost() + ":" + this.getToPort();

      return this.command + ": " + connectionStr;
  },

  type: "DiscoveryTCPConnection"
}
