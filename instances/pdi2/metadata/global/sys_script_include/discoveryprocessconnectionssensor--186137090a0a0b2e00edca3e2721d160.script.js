var DiscoveryProcessConnectionsSensor = Class.create();

DiscoveryProcessConnectionsSensor.prototype = Object.extendsObject(DiscoverySensor, {
    process: function(result) {
        this.deviceGR = this.getCmdbRecord();
        if (gs.nil(this.deviceGR) || gs.nil(result.output))
            return;

        this.listenerHash = {};
        this.connectionHash = {};
        this.cmdb_tcp_connection = [];

        this.parse(result.output);

        if (this.isDebugging())
            this.logConnections();

        this.addToRelatedList('cmdb_tcp_connection', this.cmdb_tcp_connection, 'computer', 'pid');
    },

    parse: function(output) {
        // this does nothing, the extended guys should do any parsing stuff
    },

    after: function(){
        if (gs.nil(this.getCmdbRecord()))
            return;

        // After the connections have gone through the reconciler, finish other tasks...
        new SncLayer7Connections(this.getCmdbRecord()).process();

        // Enumerate cluster IPs for cluster services listening on *
        new DiscoveryClusteredProcessHelper().layer7Connections(this.getCmdbRecord());

        // Start application mapping
        if (gs.getProperty('glide.discovery.application_mapping') == 'true')
            new SncSessionMate(this.getCmdbRecord()).process();

        var psh = new SncPrintServerHelper(this.getSensorName());
        psh.checkForPrintServer(this.getCmdbRecord());
    },

    addListener: function(dtcp) {
        var conStr = dtcp.getFromHost() + ":" + dtcp.getFromPort();
        var key = dtcp.getCommand() + "::" + conStr;

        if (this.listenerHash[key] || dtcp.getFromPort() == "0")
            return;

        // tracking one of them is enough
        this.listenerHash[key] = conStr;

        var connection = {};
        connection.command = dtcp.getCommand();
        connection.pid = dtcp.getPID();
        connection.from_ip = dtcp.getFromHost();
        connection.from_port = dtcp.getFromPort();
        connection.state = "LISTENING";

        this.cmdb_tcp_connection.push(connection);
    },

    addListeners: function(listeners) {
        for (var i = 0; i < listeners.length; i++)
            this.addListener(listeners[i]);
    },

    addConnection: function(dtcp) {
        var conStrFrom = dtcp.getFromHost() + ":" + dtcp.getFromPort();
        var conStrTo = dtcp.getToHost() + ":" + dtcp.getToPort();
        var key = dtcp.getCommand() + "::" + conStrFrom + "::" + conStrTo;

        if (this.connectionHash[key])
            return;

        // tracking one of them is enough
        this.connectionHash[key] = key;

        var connection = {};
        connection.command = dtcp.getCommand();
        connection.pid = dtcp.getPID();
        connection.from_ip = dtcp.getFromHost();
        connection.from_port = dtcp.getFromPort();
        connection.to_ip = dtcp.getToHost();
        connection.to_port = dtcp.getToPort();
        connection.state = "ESTABLISHED";

        this.cmdb_tcp_connection.push(connection);
    },

    addConnections: function(connections) {
        for (var i = 0; i < connections.length; i++)
            this.addConnection(connections[i]);
    },

    logConnections: function() {
        // This will only be printed if DEBUG is turned on!
        for (var i = 0; i < this.cmdb_tcp_connection.length; i++) {
            var connection = this.cmdb_tcp_connection[i];

            gs.log(connection.pid + " " + connection.command);
            if (connection.state == "LISTENING")
                gs.log("    " + connection.state + "   " + connection.from_ip + ":" + connection.from_port);
            else
                gs.log("    " + connection.state + "   " + connection.from_ip + ":" + connection.from_port 
                        + "->" + connection.to_ip + ":" + connection.to_port);
        }
    },

    type: "DiscoveryProcessConnectionsSensor"
});
