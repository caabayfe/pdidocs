// Discovery

var CookConnections = Class.create();
CookConnections.prototype = {
    initialize: function(cmdb_ci) {
        this.cmdb_ci = cmdb_ci;
    },

    /**
     * Transforms the given array of raw TCP connctions data into a form matching the fields of the cmdb_tcp table, with some
     * processing along the way.  The processing includes:
     * 
     * 1.  Eliminating logically duplicate entries (which are common)
     * 
     * 2.  "Exploding" global addresses ('0.0.0.0' or '*') into individual IP addresses, one for each IP on the host
     * 
     * The raw_tcp data is an array of connection info maps with the following properties:
     *   pid:        process ID of the process that owns this connection
     *   type:       "on" or "to" for listening on or connecting to, respectively
     *   ip:         the IP (v4) address we're listening on or connecting to (depending on type)
     *               Note: if type is "on", address could be global '0.0.0.0' or '*', meaning all IP addresses
     *   port:       the port we're listening on or connecting to (depending on type)
     *   local_ip:   the local IP address we're connecting from (undefined if listening on)
     *   local_port: the local port we're connecting from (undefined if listening on)
     * 
     * The result returned is an array of cmdb_tcp map objects with the following properties:
     *   pid:        process ID of the process that owns this connection
     *   type:       "on" or "to" for listening on or connecting to, respectively
     *   ip:         the IP (v4) address we're listening on or connecting to (depending on type)
     *   port:       the port we're listening on or connecting to (depending on type)
     *   local_ip:   the local IP address we're connecting from (undefined if listening on)
     *   local_port: the local port we're connecting from (undefined if listening on)
     * 
     * The result is returned.
     */
    process: function(tcps) {
        // our related list of cmdb_tcp entries...
        this.cmdb_tcp = [];

        // map of key->cmdb_tcp entries, where key = type:pid:ip:port...
        this.byKey = {};

        // get IPs till the provided limit, so we can translate '0.0.0.0' (all IPs) in separate concrete IPs...
        var ipLimit = parseInt(gs.getProperty('sn.adm.ip_expansion_limit', '1000'));
        var ci_ips = this.getIPsInCIWithLimit(this.cmdb_ci, ipLimit);

        if (ci_ips) {
            for (var i = 0; i < tcps.length; i++) {
                var tcp = tcps[i];
                if (tcp.type == 'on') {
                    var ips = [tcp.ip];
                    if (ipLimit != 0) {
                        ips = ((tcp.ip == '0.0.0.0') || (tcp.ip == '*')) ? ci_ips : [tcp.ip];
                    }
                    // iterate over all the IPs we need to create for this one...
                    for (var j = 0; j < ips.length; j++) {
                        tcp.ip = ips[j];

                        // clone this thing or else we won't really have separate entries in our array...
                        var tcp2 = {};
                        for (var name in tcp)
                            tcp2[name] = tcp[name];
                        this.addEntry(tcp2);
                    }
                } else if (tcp.type == 'to')
                    this.addEntry(tcp);
            }
        }

        return this.cmdb_tcp;
    },

    /**
     * Add the given entry to our list, assuming that it's not a duplicate.  The given entry
     * is cloned, and undesired fields are deleted.
     */
    addEntry: function(tcp) {
        var key = tcp.type + ':' + tcp.pid + ':' + tcp.ip + ':' + tcp.port;

        // don't add a duplicate of something we already have...
        if (this.byKey[key])
            return;

        // This is talking about the key field in the cmdb_tcp table. Has nothing to do with the getKey function earlier.
        tcp.key = TCPKeyGenerator.getKey(tcp.type, tcp.ip, this.cmdb_ci, tcp.port);

        // add this to our related list...
        this.cmdb_tcp.push(tcp);

        // now to our map by key...
        this.byKey[key] = tcp;
    },

    getIPsInCIWithLimit: function(ci_sysID, limit) {
        var gr = new GlideRecord('cmdb_ci');
        if (!ci_sysID || !gr.get('sys_id', ci_sysID))
            return null;

        var ipDedup = {};
        var ips = [];
        var ip;

        if (JSUtil.notNil(gr.ip_address)) {
            ips.push(gr.ip_address + '');
            ipDedup[gr.ip_address + ''] = true;
        }

        var ipgr = new GlideRecord('cmdb_ci_ip_address');
        ipgr.addQuery('nic.cmdb_ci', ci_sysID);
        ipgr.addQuery('nic.install_status', "!=", 100);
        ipgr.addQuery('install_status', '!=', 100);
        ipgr.orderBy('sys_created_on');
        if (limit > 0)
            ipgr.setLimit(limit);
        ipgr.query();
        while (ipgr.next()) {
            ip = ipgr.getValue('ip_address');
            if (!ipDedup[ip]) {
                ips.push(ip);
                ipDedup[ip] = true;
            }
        }

        return ips;
    },

    type: 'CookConnections'
};
