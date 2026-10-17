var TaskAndApprovalTableList = Class.create();
TaskAndApprovalTableList.prototype = {
    initialize: function() {},

    process: function() {
	var extensions = [];
	var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('sn_hr_sp.TodoNonTaskTables');
	for(var i = 0; i<extensionPoints.length;i++)
		extensions = extensions.concat(extensionPoints[i].getTodoTables());
        return extensions;
    },

    type: 'TaskAndApprovalTableList'
};
