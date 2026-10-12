var AutoResolutionTaskTableList = Class.create();
AutoResolutionTaskTableList.prototype = {
    initialize: function() {
    },
	
	process: function() {
		var list = GlideDBObjectManager.get().getTableExtensions('task');
		var array = [];
		for (var ii = 0; ii < list.size(); ++ii)
			array.push(list.get(ii));
		return array;
	},

    type: 'AutoResolutionTaskTableList'
};
