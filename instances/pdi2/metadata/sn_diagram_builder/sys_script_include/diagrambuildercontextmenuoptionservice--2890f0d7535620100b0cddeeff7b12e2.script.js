var DiagramBuilderContextMenuOptionService = Class.create();
DiagramBuilderContextMenuOptionService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderContextMenuOptionService'
};



DiagramBuilderContextMenuOptionService.getOptionByID = function(sysId) {
    var optionGr = DiagramBuilderContextMenuOption.getOptionByID(sysId);
	
	return {
		sysId: optionGr.getUniqueValue(),
		name: optionGr.getValue(DiagramBuilderContextMenuOption.NAME),
		script: optionGr.getValue(DiagramBuilderContextMenuOption.SCRIPT),
		showOption: optionGr.getValue(DiagramBuilderContextMenuOption.VISIBILITY_CONDITION),
		disableOption: optionGr.getValue(DiagramBuilderContextMenuOption.DISABLE_CONDITION),
	};
};
