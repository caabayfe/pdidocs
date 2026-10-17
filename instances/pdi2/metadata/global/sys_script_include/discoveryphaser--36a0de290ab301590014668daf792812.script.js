// Discovery class

/**
 * Encapsulates the notion of Discovery phases using Shazzam.
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryPhaser = Class.create();

DiscoveryPhaser.prototype = {
	initialize: function(statusGR) {
		this.status = new DiscoveryStatus(statusGR);
		this.schedule = new DiscoverySchedule(this.status.scheduleID);
	},

	hasNextPhase: function() {
		if (this.schedule.discover != "CIs" || JSUtil.nil(this.schedule.behaviorID))
			return false;

		// iterate through our device history to see what we need to exclude...
		var gr = new GlideRecord('discovery_device_history');
		gr.addQuery('status', this.status.sysID);
		gr.query();
		while (gr.next()) {
			var portProbes = gr.scratchpad.port_probes;
			if (this.anyScanned(portProbes)) {
				var ip = gr.getValue('source');
				this.schedule.exclude(ip);
			}
		}
		this.schedule.finalizeExcludes();
		
		//find if there is another hase to run
		for (var i = 0; i < this.schedule.ranges.length; i++) {
			var behavior = this.schedule.getBehaviorForRange(this.schedule.ranges[i]);

			var curPhase = this.status.getPhase(behavior);
			if (curPhase != null)
				nextPhase = behavior.nextPhase(curPhase);
			else
				nextPhase = behavior.firstPhase();

			if(nextPhase != null)
				return true;
		}

		return false;
	},

	anyScanned: function(portProbes) {
		if (!portProbes)
			return false;
		var items = portProbes.split(',');
		for (var i = 0; i < items.length; i++) {
			var itemParts = items[i].split('=');
			if (itemParts[1] == 'scanned')
				return true;
		}
		return false;
	},

	type: "DiscoveryPhaser"
}
