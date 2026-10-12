var SysUIBSearchFacetItemElementTables = Class.create();
SysUIBSearchFacetItemElementTables.prototype = {
	TABLES: [],
    initialize: function() {
		const gr = new GlideRecord('sys_db_object');
		gr.addEncodedQuery('nameSTARTSWITHsys_ux_^ORnameSTARTSWITHsys_uib_');
		gr.query();
		while (gr.next()) {
			this.TABLES.push(gr.getValue('name'));
		}
    },
	process: function() {
		return this.TABLES;
	},
    type: 'SysUIBSearchFacetItemElementTables'
};
