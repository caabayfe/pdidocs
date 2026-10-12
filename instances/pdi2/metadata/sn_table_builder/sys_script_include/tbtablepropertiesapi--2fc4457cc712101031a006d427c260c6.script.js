var TBTablePropertiesAPI = Class.create();
TBTablePropertiesAPI.prototype = {
	initialize(sysId) {
		this.sysId = sysId;
		this.tbObj = new TableDBObject(sysId);
	},

	build() {
		var result = this._validate();

		if (!result.isValid) return TBUtil.error(result);

		var tableProperties = this._tableProperties();
		return tableProperties;
	},

	_getGeneralProperties() {
		var generalInfo = {};
		var gr = this.tbObj.gr;

		generalInfo.is_extendable = JSON.parse(gr.is_extendable.toString());
		generalInfo.auto_number = !gs.nil(gr.number_ref.prefix);
		generalInfo.sys_number_sysId = gr.number_ref.sys_id.toString();
		generalInfo.prefix = gr.number_ref.prefix.toString();
		generalInfo.number = gr.number_ref.number.toString();
		generalInfo.maximum_digits = gr.number_ref.maximum_digits.toString();
		generalInfo.extends_table_label = gr.super_class.label.getDisplayValue();
		generalInfo.extends_table_sys_id = gr.super_class.sys_id.toString();
		return generalInfo;
	},

	_getAccessControls() {
		var accessInfo = {};
		var gr = this.tbObj.gr;
		//For table loading first time the accessible_from is empty in record due to some platform issue.
		accessInfo.accessible_from = gr.access.toString() || 'public';
		accessInfo.read_access = gr.read_access.toString();
		accessInfo.create_access = gr.create_access.toString();
		accessInfo.update_access = gr.update_access.toString();
		accessInfo.delete_access = gr.delete_access.toString();
		accessInfo.caller_access = gr.caller_access.toString();
		accessInfo.ws_access = gr.ws_access.toString();
		accessInfo.configuration_access = gr.configuration_access.toString();
		return accessInfo;
	},

	_tableProperties() {
		var generalProperties = this._getGeneralProperties();
		var accessControls = this._getAccessControls();
		return {
			generalInfo: generalProperties,
			accessControls,
		};
	},

	_validate() {
		var res = Validators.validateTbObjRecord(this.tbObj);
		if (!res.isValid) return res;

		res = Validators.validateTbObjAccess(this.tbObj);
		if (!res.isValid) return res;

		return {
			isValid: true,
		};
	},

	type: 'TBTablePropertiesAPI',
};
