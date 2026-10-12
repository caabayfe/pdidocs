var STTRMStateAttributeSNC = Class.create();
STTRMStateAttributeSNC.prototype = {
    initialize: function(stateAttributeGr, _gs) {
		this._gs = _gs || gs;
		this._gr = stateAttributeGr;
    },

	getAttributeRefQual: function() {
		// We have to check this as the m2m slushbucket has a null current but provides parent sttrm_state
		// Form is the opposite
		var isStateAttributeRec = this._gr && this._gr.getTableName() === "sttrm_state_attribute";
		if (!this._gr || (isStateAttributeRec && !this._gr.sttrm_state))
			return "sys_idISEMPTY";

		var stateGr = isStateAttributeRec ? this._gr.sttrm_state.getRefRecord() : this._gr;
		if (!stateGr.sttrm_model)
			return "sys_idISEMPTY";
		
		var modelGr = stateGr.sttrm_model.getRefRecord();
		var tableName = modelGr.getValue("table_name");

		// Lookup all attributes which are applicable to the table.
		var tabUtil = new TableUtils(tableName);
		var tables = j2js(tabUtil.getTables());

		var attributeGr = new GlideRecord("sttrm_attribute");
		attributeGr
			.addQuery("table_name", "ISEMPTY", null)
			.addOrCondition("table_name", "IN", tables);

		return attributeGr.getEncodedQuery();
	},

    type: 'STTRMStateAttributeSNC'
};
