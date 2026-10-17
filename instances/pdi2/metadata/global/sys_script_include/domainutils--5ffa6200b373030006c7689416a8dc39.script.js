var DomainUtils = Class.create();
DomainUtils.prototype = {
	initialize: function() {
	},
	
	// utility to create a new domain
	createDomain: function(name, parentSysIdOrName, description) {
		if (GlideStringUtil.nil(name)) {
			gs.addErrorMessage(gs.getMessage('The name is a required parameter for the domain'));
			return null;
		}
		
		var domainTable = GlideDomainSupport.getDomainTable();
		var fieldName = this._getFieldName('name', domainTable);
		var fieldParent = this._getFieldName('parent', domainTable);
		var fieldDescription = this._getFieldName('description', domainTable);
		
		// check the required fields:
		if (fieldName == null || fieldParent == null) {
			gs.addErrorMessage(gs.getMessage('The table {0} is required to have the [u_]name and [u_]parent fields.',domainTable));
			return null;
		}
		
		var parentSysId = null;
		if (parentSysIdOrName != null) {
			// the parent can be either sys_id or name
			if (GlideStringUtil.isEligibleSysID(parentSysIdOrName))
				parentSysId = parentSysIdOrName;
			else {
				var grDP = new GlideRecord(domainTable);
				grDP.get(fieldName, parentSysIdOrName);
				parentSysId = grDP.getValue('sys_id');
				if (parentSysId == null) {
					gs.addErrorMessage(gs.getMessage('Parent domain {0} is not found.',parentSysIdOrName));
					return null;
				}
			}
		}
		
		var grD = new GlideRecord(domainTable);
		grD.setValue(fieldName, name);
		grD.setValue(fieldParent, parentSysId);
		if (description != null && fieldDescription != null)
			grD.setValue(fieldDescription, description);
		
		return grD.insert();
	},
	
	// get the field name for the table, for example, 'name' or 'u_name'; return null if it doesn't exists
	_getFieldName: function(fieldName, tableName) {
		if (GlideTableDescriptor.fieldExists(tableName, fieldName))
			return fieldName;
		
		fieldName = 'u_'+fieldName;
		if (GlideTableDescriptor.fieldExists(tableName, fieldName))
			return fieldName;
		
		return null;
	},
	
	type: 'DomainUtils'
	
};
