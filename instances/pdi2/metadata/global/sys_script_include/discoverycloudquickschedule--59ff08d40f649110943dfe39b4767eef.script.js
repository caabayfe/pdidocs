var DiscoveryCloudQuickSchedule = Class.create();

DiscoveryCloudQuickSchedule.prototype = Object.extend(new DiscoveryQuickSchedule(), {

    initialize: function() {
        // initialize this instance...
        this.valid = true;
        this.name             		= "Cloud Quick Discovery";
        this.sysID            		= null;
        this.midServerID      		= null;
        this.behaviorID       		= null;
        this.discover         		= "Cloud Resources";
        this.active           		= true;
        this.location         		= null;
        this.maxRun           		= null;
        this.includeAlive     		= null;
        this.logStateChanges  		= true;
        this.midServer        		= new MIDServer();
        this.ranges           		= [];
        this.excludes         		= null;
        this.rangesDB         		= null;
		this.shazzamBatchSize 		= 5000;
		this.shazzamClusterSupport 	= true;
		this.midSelectAuto = function() { return (autoSelectMid ? true : false); };	
    },


    type: 'DiscoveryCloudQuickSchedule'
});
