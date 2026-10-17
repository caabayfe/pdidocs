var CMDBPageTemplatesUtility = Class.create();
CMDBPageTemplatesUtility.prototype = {
	initialize: function() {
		this.CMDB_CI = 'cmdb_ci';
	},
	
	isExtensionOfCmdbCi: function(className) {
		var table = new GlideTableHierarchy(className);
		var hierarchy = table.getHierarchy();
		
		for (var i = 0; i < hierarchy.length; i++) {
			if (hierarchy[i] === this.CMDB_CI) {
				return true;
			}
		}
		
		return false;
	},

	type: 'CMDBPageTemplatesUtility'
};
