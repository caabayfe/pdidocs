var DiagramBuilderDiagramTemplateService = Class.create();
DiagramBuilderDiagramTemplateService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderDiagramTemplateService'
};

DiagramBuilderDiagramTemplateService.getTemplateJSON = function(templateId) {
	var diagramTemplate = null;
	var diagramTemplateGr = DiagramBuilderDiagramTemplate.getDiagramTemplate(templateId);
	if (diagramTemplateGr)
		diagramTemplate = diagramTemplateGr.getValue(DiagramBuilderDiagramTemplate.TEMPLATE_JSON);
	return diagramTemplate;
		
};
