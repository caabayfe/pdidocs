var SysAppPayloadGeneratorSourceIDTables = Class.create();
SysAppPayloadGeneratorSourceIDTables.prototype = {
    initialize: function() {
    },
	process: function() {
		// For now limit the user to select scoped applications. When update sets are supported we will
		// add the sys_update table to this array.
		var sourceIdTables = ['sys_app'];
		return sourceIdTables;
	},
    type: 'SysAppPayloadGeneratorSourceIDTables'
};
