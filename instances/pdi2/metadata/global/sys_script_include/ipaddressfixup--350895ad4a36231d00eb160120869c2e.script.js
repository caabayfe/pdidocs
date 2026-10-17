// Discovery 
gs.include('PrototypeServer');

/**
 * Grooms the CMDB, ensuring that IP addresses are valid and unique to their containing device CI.
 * @author bow.rugerri, tom.dilatush, aleck.lin
 */
var IPAddressFixup = Class.create();

IPAddressFixup.prototype = {
    initialize: function(cmdb_ci) {
        this.ci = cmdb_ci;
    },

    fix: function() {
        // Verify if the Ci class is not extended from any classes in "glide.discovery.exclude_ip_sync_classes" property that we don't want to replace with it with NIC ip-addresses.
        var exclude_ip_sync_classes = GlideProperties.get('glide.discovery.exclude_ip_sync_classes').split(',');
        var hdGr = new GlideRecord('cmdb_ci_hardware');
        var syncClass = true;
        if (hdGr.get('sys_id', this.ci)) {
            var ciTable = hdGr.getValue('sys_class_name');
            var hierarchy = GlideDBObjectManager.getTables(ciTable);
            for (var i = 0; i < exclude_ip_sync_classes.length && syncClass; i++)
                if (hierarchy.contains(exclude_ip_sync_classes[i]))
                    syncClass = false;
        }

        var enforce_unique_ip = GlideProperties.getBoolean('glide.discovery.enforce_unique_ips', false);
        if (enforce_unique_ip)
            this.enforceUniqueIP();
    },

    setParentIP: function(ip) {
        var gr = new GlideRecord('cmdb_ci_hardware');
        if (this.ci && gr.get('sys_id', this.ci)) {
            gr.ip_address = ip;
            gr.update();
        }
    },

    getParentIP: function() {
        var gr = new GlideRecord('cmdb_ci_hardware');
        if (this.ci && gr.get('sys_id', this.ci))
            return gr.ip_address + '';
    },

    enforceUniqueIP: function() {
        var ciGR = new GlideRecord('cmdb_ci_hardware');
        ciGR.get('sys_id', this.ci);
        var ipStr = ciGR.ip_address + '';
        var ourIP = new SNC.IPAddress(ipStr);
        if ((!ourIP.isValid()) || (ourIP.isLocalhost()) || (ourIP.isLinkLocalAddress()))
            return;

        this.wipeIP('cmdb_ci_hardware', ipStr);
    },

    wipeIP: function(tablename, ip) {
        var ciGR = new GlideRecord(tablename);
        ciGR.addQuery('ip_address', ip);
        ciGR.addQuery('sys_id', '!=', this.ci);
        ciGR.query();
        while (ciGR.next()) {
            ciGR.ip_address = '';
            ciGR.update();
        }
    },

    type: 'IPAddressFixup'
};
