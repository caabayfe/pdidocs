var DiagramBuilderDiagramTemplate = Class.create();

// table name
DiagramBuilderDiagramTemplate.TABLE = 'sn_diagram_builder_diagram_template';

// field names
DiagramBuilderDiagramTemplate.TEMPLATE_JSON = 'template_json';

DiagramBuilderDiagramTemplate.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
		this.table = DiagramBuilderDiagramTemplate.TABLE;
    },
    type: 'DiagramBuilderDiagramTemplate'
});

DiagramBuilderDiagramTemplate.getDiagramTemplate = function(templateId) {
    return new DiagramBuilderDiagramTemplate().getById(templateId);
};
