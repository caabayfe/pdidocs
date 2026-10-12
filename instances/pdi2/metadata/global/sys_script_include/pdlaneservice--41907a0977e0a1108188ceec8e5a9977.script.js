var PDLaneService = Class.create();
PDLaneService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDLaneRepository();
    },
    type: 'PDLaneService',
    getLanes: function(processDefinitionId) {
        return this.repository.getLanes(processDefinitionId);
    },
    insertLanes: function(lanes) {
        return (lanes || []).map(function(fields) {
            return this.repository.insertLane(fields);
        }.bind(this));
    },
    updateLanes: function(lanes, processSchemaVersion) {
        return (lanes || []).map(function(fields) {
            var copiedFields = PDUtils.shallowClone(fields);
            copiedFields.processSchemaVersion = processSchemaVersion;
            return this.repository.updateLane(copiedFields);
        }.bind(this));
    },
    deleteLanes: function(laneIds) {
        this.repository.deleteLanes((laneIds || []).join(','));
    }
};
