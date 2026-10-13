// Discovery class

/**
 * Aleck Lin aleck.lin@service-now.com
 */
var DiscoveryQuickSchedule = Class.create();

DiscoveryQuickSchedule.prototype = Object.extend(new DiscoverySchedule(), {
    /*
     * Create a transient schedule that automatically does CI configuration Discovery
	 * It makes some very basic assumptions about what kind of discovery it is.
     */
    initialize: function(ip, midserverID, autoSelectMid) {
        // initialize this instance...
        this.valid = true;
        this.name             		= "Ad hoc discovery"
        this.sysID            		= null;
        this.midServerID      		= midserverID;
        this.behaviorID       		= null;
        this.discover         		= "CIs";
        this.active           		= true;
        this.location         		= null;
        this.maxRun           		= null;
        this.includeAlive     		= null;
        this.logStateChanges  		= true;
        this.midServer        		= new MIDServer(this.midServerID);
        this.ranges           		= [];
        this.excludes         		= null;
        this.rangesDB         		= null;
		this.shazzamBatchSize 		= 5000;
		this.shazzamClusterSupport 	= true;
		this.midSelectAuto = function() { return (autoSelectMid ? true : false); };
						
        var ip = SNC.IPAddress.get(ip);
    	var ip_coll = new SNC.IPCollection.newIPListCollection();
		ip_coll.add(ip);
		
		this.ranges.push(ip_coll);		
    },


    type: 'DiscoveryQuickSchedule'
});
