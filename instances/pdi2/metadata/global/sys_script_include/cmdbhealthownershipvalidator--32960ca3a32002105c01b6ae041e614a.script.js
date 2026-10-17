var CmdbHealthOwnershipValidator = Class.create();
CmdbHealthOwnershipValidator.prototype = {
	
    initialize: function() {
		this.CMDB_CI = 'cmdb_ci';
		this.SYS_USER = 'sys_user';
		this.SYS_USER_GROUP = 'sys_user_group';
    },

	validateColumn: function(newFieldValue) {
		// if value is nil or empty, return false
		if (!newFieldValue) {
			return false;
		}

		var trimmedValue = newFieldValue.trim();
		if (!trimmedValue) {
			return false;
		}

		// if value is not a reference to sys user or sys user group, return false
		var td = new GlideTableDescriptor(this.CMDB_CI);

		if (td.isValidField(trimmedValue)) {
			var gr = new GlideRecord(this.CMDB_CI);
			var ele = gr.getElement(trimmedValue);

			var refTable = ele.getReferenceTable();

			if (!refTable || (refTable != this.SYS_USER && refTable != this.SYS_USER_GROUP)) {
				return false;
			}
		} else {
			return false;
		}

		// in all other cases, return true
		return true;
	},

    type: 'CmdbHealthOwnershipValidator'
};
