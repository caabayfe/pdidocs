// Discovery SNMP Network Interfaces class
gs.include("PrototypeServer");

/**
 * Handles creating network interfaces for JavaScript SNMP sensors.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var SNMPNetworkInterfaces = Class.create();

SNMPNetworkInterfaces.prototype = {
    initialize: function() {
        this.IPAddressV4 = SncIPAddressV4;
        this.MACAddress = SncMACAddress;
        this.XMLMemoryTable = GlidesoftXMLMemoryTable;
    },

    /*
     * Does the actual work of analyzing the SNMP data and reconciling the discovered NICs to the CMDB's NICs.
     * 
     * cmdb_ci: the sys_id of the CI
     * doc: the SNMP data in XML document form
     * (@deprecated) isComputer: true if this is a computer, false otherwise 
     * agent: the name of the MID server
     * ecc_sys_id: the sys_id of the ECC queue record with the input
     */
    process: function(cmdb_ci, doc, isComputer, agent, ecc_sys_id) {
        // first analyze the SNMP data to get our IP address table...
        var fIpAddressTable = null;
        var fNetworkInterfaces = this._getXMLMemoryTable('interfaces', doc, '//ifEntry');
        var rawAddresses = this._getXMLMemoryTable('ipAddresses', doc, '//ipAddrEntry');
        if (rawAddresses && fNetworkInterfaces)
            fIpAddressTable = rawAddresses.join('ipAdEntIfIndex', fNetworkInterfaces, 'ifIndex');

        // if we didn't find anything, just bail out of here...
        if (!fIpAddressTable)
            return;

        var adapterList = [];

        // next we reconcile the addresses we found with what's already in the database...
        fIpAddressTable.first();
        while (fIpAddressTable.next()) {
            var ipAddr = fIpAddressTable.getValue('ipAdEntAddr');
            var macAddr = fIpAddressTable.getValue('ifPhysAddress');
            var ip = this.IPAddressV4.getIPAddressV4Instance(ipAddr);
            var mac = this.MACAddress.getMACAddressInstance(macAddr);
            if (mac && ip && (!ip.isLocalhost())) {
                var adapter = {};
                adapter.name = fIpAddressTable.getValue('ifDescr');
                adapter.ip_address = ip.getAddressAsString();
                adapter.mac_address = mac.getAddressAsString();

                adapterList.push(adapter);
            }
        }

        g_sensor.addToRelatedList('cmdb_ci_network_adapter', adapterList, 'cmdb_ci', 'name,ip_address');
    },

    _getXMLMemoryTable: function(tableName, doc, path) {
        var result = null;
        try {
            result = this.XMLMemoryTable.getFromDocAndXPath(tableName, doc, path);
        } catch (ex) {
            // do nothing; we'll return a null...
        }
        return result;
    },

    type: 'SNMPNetworkInterface'
}
