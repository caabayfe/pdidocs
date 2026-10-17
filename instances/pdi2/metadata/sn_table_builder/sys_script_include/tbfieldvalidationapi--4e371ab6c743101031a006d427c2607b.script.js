var TBFieldValidationAPI = Class.create();
TBFieldValidationAPI.prototype = {
	initialize(table, payload) {
		this.table = table;
		this.payload = payload;
	},

	build() {
		return this._validate();
	},

	_validate() {
		var validationInput = this.payload;
		var tableHeirarchy = TBQueries.getTables(this.table);
		if (validationInput['element']) {
			return this._validateColumnName(tableHeirarchy, validationInput);
		}
		return {
			isValid: true,
			message: '',
		};
	},

	_validateColumnName(tableHeirarchy, validationInput) {
		var result = {};
		var columnName = validationInput['element'];
		var recordId = validationInput['sysId'];
		var count;
		var gr = new GlideAggregate(TBConstants.SYS_CLASS_DICTIONARY);
		gr.addAggregate('COUNT');
		gr.addQuery('name', 'IN', tableHeirarchy);
		gr.addQuery('element', columnName);
		gr.addQuery('sys_id', '!=', recordId);
		gr.query();

		if (gr.next()) count = gr.getAggregate('COUNT');
		if (count == 0 || count == '0') {
			result['isValid'] = true;
			result['message'] = '';
		} else {
			result['isValid'] = false;
			result['message'] = gs.getMessage(
				'Column value already exists in this table or a table extended from it'
			);
		}
		return result;
	},

	type: 'TBFieldValidationAPI',
};
