var SNHelpDBController = Class.create();
SNHelpDBController.prototype = {
	INVALID_TABLE : "SNHelpDBController: {0} is not a valid table",
	CREATE_ERROR : "SNHelpDBController: Error Creating record in {0} table",
	RECORD_NOT_FOUND : "SNHelpDBController: No record found with sys_id - {0}",
	UPDATE_ERROR : "SNHelpDBController: Error Updating record in {0} table",
	INVALID_SYS_ID : "SNHelpDBController: Invalid sys_id - {0}",

    initialize: function(table) {
		this.table = table;
		this.constants = new SNHelpConstantProvider();
    },
	
	create: function(params) {
		var gr = new GlideRecord(this.table);

		if(!this._isValidTable(gr))
			return;
		
		gr.initialize();
		this._setFieldsData(gr, params);
		var sys_id = gr.insert();
		if(sys_id)
			return sys_id;
		else
			gs.error(this.CREATE_ERROR, this.table);
	},
	update: function(sys_id, params) {
		var gr = new GlideRecord(this.table);

		if(!this._isValidSysId(sys_id) || !this._isValidTable(gr) || !this._isValidRecord(gr, sys_id))
			return;
		
		this._setFieldsData(gr, params);
		
		sys_id = gr.update();
		if(sys_id) 
			return sys_id;
		else 
			gs.error(this.UPDATE_ERROR, this.table);
	},
	
	getById: function(sys_id, fields) {
		var gr = new GlideRecord(this.table);

		if(!this._isValidSysId(sys_id) || !this._isValidTable(gr) || !this._isValidRecord(gr, sys_id))
			return null;
		
		if(this.skipACLCheck() || gr.canRead())
			return this._getFieldsData(gr, fields);
		else
			return null;
	},
	
	getByEncodedQuery: function(queryString, orderBy, fields) {
		var gr = new GlideRecord(this.table);

		if(!this._isValidTable(gr))
			return;
		
		// Without table read access every row would be rejected by the per-row check below,
		// so skip the ACL-enforced query and the warning it posts for each queried field.
		if(!this.skipACLCheck() && !gr.canRead())
			return [];
		
		if(orderBy && gr.isValidField(orderBy))
			gr.orderBy(orderBy);
		// Enforce field ACLs on the query itself, not just the returned rows, to block ^JOIN oracle attacks.
		gr.addEncodedQuery(queryString, true);
		gr.query();
		
		var result = [];
		
		while (gr.next()) {
			if(this.skipACLCheck() || gr.canRead())
				result.push(this._getFieldsData(gr, fields));
		}
		return result;
	},

	_isValidTable: function(gr) {
		if(!gr.isValid()) {
			gs.error(this.INVALID_TABLE, this.table);
			return false;
		}
		return true;
	},

	_isValidSysId: function(sys_id) {
		if(!GlideStringUtil.isEligibleSysID(sys_id)) {
			gs.error(this.INVALID_SYS_ID, sys_id);
			return false;
		}
		return true;
	},

	_isValidRecord: function(gr, sys_id) {
		var exist = gr.get(sys_id);
		if(!exist) {
			gs.error(this.RECORD_NOT_FOUND, sys_id);
			return false;
		}
		return true;
	},

	_setFieldsData: function(gr, params) {
		var keys = Object.keys(params);
		var glideElement;
		var internalType;
		
		for(var i = 0; i < keys.length; i++) {
			if(!gr.isValidField(keys[i]))
				continue;
			glideElement = gr.getElement(keys[i]);
			internalType = glideElement.getED().getInternalType();
			if(internalType === "translated_html" || internalType === "translated_text") {
				glideElement.setDisplayValue(params[keys[i]]);
			} else 
				glideElement.setValue(params[keys[i]]);
		}
	},

	_getFieldsData: function(gr, fields) {
		var gRU = new GlideRecordUtil();
		
		if(!(Array.isArray(fields) && fields.length > 0))
			fields = gRU.getFields(gr);
		
		var result = {};
		var glideElement;
		var descriptor;
		for(var i = 0; i < fields.length; i++) {
			
			if(!gr.isValidField(fields[i]))
				continue;
			
			glideElement = gr.getElement(fields[i]);
			descriptor = glideElement.getED();
			// strict equality operator is not working ===
			if(descriptor.getInternalType() == 'user_image' || descriptor.getInternalType() == 'translated_html' || descriptor.getInternalType() == 'translated_text')
				result[glideElement.getName()] = glideElement.getDisplayValue();
			else if (descriptor.getInternalType() == "simple_name_values"){
				var el = JSON.parse(glideElement.getDisplayValue());
				for(key in el)
					el[key] = gs.getMessage(el[key]);
				result[glideElement.getName()] = JSON.stringify(el);
			} else if (glideElement.getName() == this.constants.tableColumns.eh_content) {
				result[glideElement.getName()] = glideElement + "";
				var aiGeneratedElem = glideElement.getRefRecord().getElement(this.constants.tableColumns.ai_generated);
				if(aiGeneratedElem != null) {
					result[aiGeneratedElem.getName()] = aiGeneratedElem + "";
				}
			}
			else
				result[glideElement.getName()] = glideElement + "";
		}
		return result;
	},
	// Skip checking Read ACL on help_content and embedded_help_content table
	skipACLCheck : function() {
		if(this.table === this.constants.tables.content || this.table === this.constants.tables.eh_content)
			return true;
		return false;
	},

    type: 'SNHelpDBController'
};
