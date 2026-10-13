var ADMRefreshSchedule = Class.create();

ADMRefreshSchedule.prototype = Object.extend(new DiscoverySchedule(), {
    /*
     * Create a transient schedule that automatically refreshes a hosts Processes/Connections
	 * It makes some very basic assumptions about what kind of discovery it is.
     */
    initialize: function(ip, ciId) {
        // initialize this instance...
        this.valid = true;
        this.name             		= "ADM Refresh";
        this.sysID            		= ciId;
        this.midServerID      		= null;
        this.behaviorID       		= null;
        this.discover         		= "Processes/Connections";
        this.active           		= true;
        this.location         		= null;
        this.maxRun           		= null;
        this.includeAlive     		= null;
        this.logStateChanges  		= true;
        this.midServer        		= null;
        this.ranges           		= [];
        this.excludes         		= null;
        this.rangesDB         		= null;
						
        var ipV4 = SNC.IPAddressV4.get(ip);
    	var ip_coll = new SNC.IPCollection.newIPListCollection();
		ip_coll.add(ipV4);
		
		this.ranges.push(ip_coll);		
    },


    type: 'ADMRefreshSchedule'
});
