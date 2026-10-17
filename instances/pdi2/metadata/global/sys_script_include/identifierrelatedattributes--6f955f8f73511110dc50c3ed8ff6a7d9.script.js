var IdentifierRelatedAttributes = Class.create();
IdentifierRelatedAttributes.prototype = {
    initialize: function() {
    },
	
	/* 
	Get all the reference fields from table that refer to the absolute parent of value.applies_to
	Params:
		table: Related table
		containingTable: cmdb_related_entry or table of record which calls this script
		value: identifier reference
	*/
	process: function(table, containingTable, value) {
		// get the absolute parent of the identifier applies to table
		var identifierGr = new GlideRecord('cmdb_identifier');
		identifierGr.get(value);
		var baseTable = new IdentificationLookUpTables().getParent(identifierGr.applies_to);
		
		// look up references for the related table using the absolute parent of the identifier applies to
		// get all the fields of the related table
		var gr = new GlideRecord(table);
		gr.initialize();
		var fields = gr.getFields();

		var result = [];
		for (var i = 0; i < fields.size(); i++) {
			// if this field is a reference and is referencing our base table, push it into the result set
			// example of base tables: cmdb_ci, cmn_location, sys_user, etc.
			var fieldEd = fields.get(i).getED();
			if (fieldEd.isReference()) {
				if (fieldEd.getReference() == baseTable) {
					result.push(fieldEd.getReference());
				}
			}
		}
		
		return result;
	},

    type: 'IdentifierRelatedAttributes'
};
