var DiscoveryCreateRangeSets = Class.create();

DiscoveryCreateRangeSets.launch = function() {
    var sw = new GlideScriptWriter();
    sw.appendLine('var crs = new DiscoveryCreateRangeSets();');
    sw.appendLine('crs.processNetworks();');
    sw.evaluateAsync();
};

DiscoveryCreateRangeSets.prototype = {
    initialize: function() {
        this.lastRouterID = null;
        this.rangeSetID = null;
    },
    
	/**
	 * @return boolean TRUE on success, FALSE if no valid range items exist.
	 */	
    processNetworks: function() {
        var netGR = new GlideRecord('cmdb_ci_ip_network');
        netGR.addQuery('discover', true);
        netGR.addNotNullQuery('router');
        netGR.addQuery('state', 'Ready');
        netGR.orderBy('router');
        netGR.query();
		if (!netGR.hasNext()) // no valid records
			return false;
		
        while (netGR.next()) 
            this.processNetwork(netGR);
		
		return true;
    },

    processNetwork: function(netGR) {
        if (this.rangeSetContainsItem(netGR))
            return;

        this.createRangeItem(netGR.subnet);
        netGR.state = 'Processed';
        netGR.update();
    },

    rangeSetContainsItem: function(netGR) {
        //ensures that the rangeset exists, if not it is created
        this.ensureRangeSet(netGR.getValue('router'));

        var subnet = netGR.subnet;

        // check if our range set contains the IP network, if not we need to create it
        var riGR = new GlideRecord('discovery_range_item');
        riGR.addQuery('parent', this.rangeSetID);
        riGR.addQuery('type', 'IP Network');
        riGR.addQuery('name', 'Subnet: ' + subnet);
		riGR.query();
        if (riGR.next())
            return true;

        return false;
    },

    ensureRangeSet: function(routerID) {
        if (this.lastRouterID == routerID)
            return;

        this.lastRouterID = routerID;
        var rtrGR = new GlideRecord('cmdb_ci');
        rtrGR.get(routerID);
        var rtrName = rtrGR.isValid() ? rtrGR.name : 'none';
        var rsGR = new GlideRecord('discovery_range');
        var rsName = 'Router: ' + rtrName;
        rsGR.addQuery('name', rsName);
        rsGR.query();
        if (rsGR.next()) {
            this.rangeSetID = rsGR.sys_id;
            return;
        }
        rsGR.initialize();
        rsGR.name = rsName;
        rsGR.active = true;
        this.rangeSetID = rsGR.insert();
    },
	
    createRangeItem: function(subnet) {
        var snParts = subnet.split('/');
        if (snParts.length != 2)
            return;

        var riGR = new GlideRecord('discovery_range_item');
        riGR.initialize();
        riGR.name = 'Subnet: ' + subnet;
        riGR.parent = this.rangeSetID;
        riGR.type = 'IP Network';
        riGR.active = true;
        riGR.network_ip = snParts[0];
        riGR.netmask = snParts[1];
        riGR.insert();
    },
   
    type: 'DiscoveryCreateRangeSets'
}
