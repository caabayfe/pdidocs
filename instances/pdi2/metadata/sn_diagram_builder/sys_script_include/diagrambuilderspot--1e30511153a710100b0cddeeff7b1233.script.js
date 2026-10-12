var DiagramBuilderSpot = Class.create();

// table name
DiagramBuilderSpot.TABLE = 'sn_diagram_builder_spot';

// table fields
DiagramBuilderSpot.SPOT_NAME = 'spot_name';
DiagramBuilderSpot.COORDINATE_X = 'x';
DiagramBuilderSpot.COORDINATE_Y = 'y';

// initialize script include by extending Crud base
DiagramBuilderSpot.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderSpot.TABLE;
    },
    type: 'DiagramBuilderSpot'
});

DiagramBuilderSpot.getSpotById = function(spotId) {
    return new DiagramBuilderSpot().getById(spotId);
};
