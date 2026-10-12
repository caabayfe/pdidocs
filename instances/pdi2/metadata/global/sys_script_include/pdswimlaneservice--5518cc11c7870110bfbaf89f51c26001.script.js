var PDSwimLaneService = Class.create();
PDSwimLaneService.prototype = {
    initialize: function(opts) {
		this.repository = (opts && opts.repository) || new PDSwimLaneRepository();
	},
	type: 'PDSwimLaneService',
	insertSwimLanes: function(swimLanes) {
		return (swimLanes || []).map(function(fields) {
			return this.repository.insertSwimLane(fields);
		}.bind(this));
	},
	updateSwimLanes: function(swimLanes) {
		return (swimLanes || []).map(function(fields) {
			return this.repository.updateSwimLane(fields);
		}.bind(this));
	},
	deleteSwimLanes: function(swimLaneIds) {
		this.repository.deleteSwimLanes((swimLaneIds || []).join(','));
	}
};
