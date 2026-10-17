var DiagramBuilderNodeMenuOptionService = Class.create();
DiagramBuilderNodeMenuOptionService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeMenuOptionService'
};



DiagramBuilderNodeMenuOptionService.getOptionsByNodeType = function(nodeType) {
    var optionsGr = DiagramBuilderNodeMenuOption.getOptionsByNodeType(nodeType);
	var options = [];
	while (optionsGr.next()) {
        options.push(DiagramBuilderContextMenuOptionService.getOptionByID(optionsGr.getValue(DiagramBuilderNodeMenuOption.MENU_OPTION)));
    }
	return options;
};
