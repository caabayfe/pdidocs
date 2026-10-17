// Discovery

/**
 * @auther Aleck Lin aleck.lin@servicenow.com
 */

var DeviceL3Mapping = Class.create();

DeviceL3Mapping.prototype = {

    initialize: function(deviceGr) {
        this.deviceGr = deviceGr;
        this.deviceIPs = [];
        this.routers = [];
    },

    map: function() {
        try {
            if (JSUtil.nil(this.deviceGr))
                return;

            var skipNets;

            // This code is only helpful when L3 mapping can't keep up with discovery. The current version of L3 mapping is
            // plenty fast enough to keep up so there's no need to make this check.
            // Uncomment this code if the instance has a huge backlog of unprocessed events.
            // See if a newer discovery is going to ask for L3 mapping again - if
            // so we'll map based on that discovery instead of this one.
            //			var gr2 = new GlideRecord('discovery_device_history');
            //			gr2.addQuery('cmdb_ci', this.cmdb_ci);
            //			gr2.addQuery('sys_updated_on', '>',  this.sys_updated_on);
            //			gr2.setLimit(1);
            //			gr2.query();
            //			if (gr2.getRowCount())
            //				return;

            // APIPA is 169.254.0.0/16.
            // Add customer-specific networks to the property if desired. Only IPv4 network addresses are supported.
            skipNets = gs.getProperty('glide.discovery.L3_mapping.skip_nets', '169.254.0.0/16,127.0.0.0/8');
            this.skipNets = skipNets.split(',').map(function(net) {
                try {
                    return new SncIPNetwork(net) + '';
                } catch (e) {
                    gs.error('L3Mapping: Caught exception when parsing glide.discovery.L3_mapping.skip_nets: ' + e.toString());
                }
            });

            // Attempt to include device location when mapping? This should be true if IP ranges are re-used
            // at different locations, and if 'location' is set on relevant Discovery schedules.
            this.useLocation = gs.getProperty('glide.discovery.L3_mapping.use_location', false);

            // Find all the IPs that belong to the device
            this._findAllDeviceIPs();
            if (!this.deviceIPs || this.deviceIPs.length == 0)
                return;

            // Collect all the routers that the IP address is part of...
            this._collectRouters();
            if (this.routers.length == 0)
                return;

            this._reconcileRelationships();
        } catch (e) {
            gs.error('L3Mapping: ' + this.deviceGr.sys_id + ' got error' + e.toString() + '\n' + e.stack);
        }
    },

    _reconcileRelationships: function() {
        var relgr, routerId, name, childSysId;
        var created = 0;
        var toDelete = [];
        var relTypes = [];
        var relTypeGr = new GlideRecord('cmdb_rel_type');

        // We have to cmdb_rel_type records for IP Connection::IP Connection
        relTypeGr.addQuery('parent_descriptor', 'IP Connection');
        relTypeGr.addQuery('child_descriptor', 'IP Connection');
        relTypeGr.query();
        while (relTypeGr.next())
            relTypes.push(relTypeGr.sys_id + '');

        var IPRelationTargets = {};
        relgr = new GlideRecord("cmdb_rel_ci");
        relgr.addQuery("parent", this.deviceGr.sys_id);
        relgr.addQuery("type", 'IN', relTypes);
        relgr.query();
        while (relgr.next()) {
            childSysId = relgr.child + '';
            if (IPRelationTargets[childSysId])
                toDelete.push(relgr.sys_id + '');
            else
                IPRelationTargets[childSysId] = relgr.sys_id + '';
        }

        for (var i = 0; i < this.routers.length; i++) {
            routerId = this.routers[i];
            // There's already a relationship, make sure we don't delete it. (Setting to undefined is faster than deleting from the object)
            if (IPRelationTargets[routerId])
                IPRelationTargets[routerId] = undefined;
            else {
                created++;
                SncECMDBUtil.createCIRelationship('cmdb_rel_ci', this.deviceGr.sys_id, routerId, 'IP Connection', 'IP Connection');
            }
        }

        // If there are still entries in the IPRelationTargets, that means they're stale relationships, remove them.
        for (name in IPRelationTargets)
            if (IPRelationTargets[name])
                toDelete.push(IPRelationTargets[name]);

        if (!toDelete.length && !created)
            return;

        relgr = new GlideRecord("cmdb_rel_ci");
        relgr.addQuery('sys_id', 'IN', toDelete);
        relgr.deleteMultiple();
    },

    _findAllDeviceIPs: function() {
        var net;
        var foundBase;
        var ips = {};
        var baseIP = this.deviceGr.ip_address + '';

        var gr = new GlideRecord("cmdb_ci_ip_address");
        gr.addQuery("nic.cmdb_ci", this.deviceGr.sys_id);
        gr.addQuery('ip_version', 4);
        gr.addQuery('install_status', 1); //only installed
        gr.addQuery('nic.install_status', 1); //only installed nic - PRB1309396
        gr.query();
        while (gr.next()) {
            var ip = gr.ip_address + '';
            if (ip == baseIP)
                foundBase = true;
            net = new SncIPNetworkV4(ip + '/' + gr.nic.netmask) + '';
            if (!this.skipNets.some(function(skipNet) {
                    return skipNet === net;
                }))
                ips[net] = 1;
        }

        if (!foundBase && JSUtil.notNil(baseIP) && SncIPAddress.isV4(baseIP))
            ips[baseIP] = 1; // At least get the ip_address field

        this.deviceIPs = Object.keys(ips);
    },

    _collectRouters: function() {
        var _this = this;
        var queried = {};
        var routers = {};
        var routing_tables = ['cmdb_ci_ip_switch', 'cmdb_ci_ip_router'];
        var location = this.deviceGr.location;
        var gr;

        if (this.useLocation) {
            handleAllAddresses(true);
            if (this.routers.length)
                return;
        }

        queried = {};
        handleAllAddresses();

        function handleAllAddresses(withLocation) {
            // Collect all the routers that the IP address is part of...
            for (var i = 0; i < _this.deviceIPs.length; i++) {
                var ip_address = _this.deviceIPs[i];

                if (ip_address.indexOf("/") > 0)
                    handleAddress(ip_address, withLocation);
                else {
                    for (netmask = 32; netmask >= 8; netmask--) {
                        if (handleAddress(ip_address + '/' + netmask, withLocation))
                            break;
                    }
                }
            }
            _this.routers = Object.keys(routers);
        }

        function handleAddress(ip_address, withLocation) {
            var ip_network = new SncIPNetworkV4(ip_address),
                hi_ip = new SncAddress32Bit(ip_network.getBroadcastAddress()).getAddressAsLong(),
                lo_ip = new SncAddress32Bit(ip_network.getAddress()).getAddressAsLong(),
                key = lo_ip + ":" + hi_ip;

            if (queried[key])
                return true;
            queried[key] = true;

            var gr = new GlideRecord("dscy_route_interface");
            gr.addQuery("cmdb_ci.sys_class_name", "IN", routing_tables);
            gr.addQuery("sys_domain", _this.deviceGr.sys_domain); // PRB1341362
            gr.addQuery("install_status", 1); // only match installed routes - PRB1252594
            gr.addQuery("hi_ip", hi_ip);
            gr.addQuery("lo_ip", lo_ip);
            gr.addQuery('type', 3);

            gr.addNotNullQuery('dest_ip_network');
            gr.addNullQuery('cmdb_ci.duplicate_of');

            if (withLocation && location)
                gr.addQuery('cmdb_ci.location', location);
            gr.query();

            if (!gr.hasNext())
                return false;

            while (gr.next()) {
                //PRB660627: filter out any routers with the default route (0.0.0.0)
                var dest_ip_network = gr.getValue("dest_ip_network");
                if (!dest_ip_network.startsWith("0.0.0.0"))
                    routers['' + gr.cmdb_ci] = 1;

            }
            return true;
        }

    },

    _logError: function(msg) {
        var logger,
            gr = new GlideRecord('discovery_device_history');

        if (gr.get('sys_id', current.sys_id)) {
            logger = new DiscoveryLogger(gr.status, current.sys_id);
            logger.setSource('DeviceL3Mapping');
            this._logMsg = function(msg) {
                logger.error(msg);
            };
        } else
            this._logMsg = function(msg) {
                gs.error(msg, 'DeviceL3Mapping');
            };

        this._logMsg(msg);
    }
};
