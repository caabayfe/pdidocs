var DiagramBuilderSpotService = Class.create();

DiagramBuilderSpotService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderSpotService',
};

DiagramBuilderSpotService._constructSpotObject = function(spotGr) {
    if (spotGr.isValidRecord())
        return {
            sysId: spotGr.getUniqueValue(),
            spotName: spotGr.getValue(DiagramBuilderSpot.SPOT_NAME),
            x: spotGr.getValue(DiagramBuilderSpot.COORDINATE_X), // Spot's X coordinate
            y: spotGr.getValue(DiagramBuilderSpot.COORDINATE_Y) // Spot's Y coordinate
        };
    else
        return null;
};

DiagramBuilderSpotService.getSpotById = function(spotId) {
    var spotGr = DiagramBuilderSpot.getSpotById(spotId);
    return DiagramBuilderSpotService._constructSpotObject(spotGr);
};
