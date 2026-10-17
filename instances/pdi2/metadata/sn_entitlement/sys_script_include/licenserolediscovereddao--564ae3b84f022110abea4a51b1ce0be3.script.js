var LicenseRoleDiscoveredDao = Class.create();

LicenseRoleDiscoveredDao.prototype = {
    initialize: function() {
		this.NEW = 'New';
		this.SYNCED = 'Synced';
		this.ERROR = 'Error';
		this.DELETED = 'Deleted';
		this.STATE_VALUE_MAP = new Map([['0', this.NEW], ['1', this.SYNCED], ['2', this.ERROR], ['3', this.DELETED]]);
		this.STATE_LABEL_MAP = new Map([[this.NEW, '0'], [this.SYNCED, '1'], [this.ERROR, '2'], [this.DELETED, '3']]);
    },

	/**
	 * Lookup discovered role information for specified roleNames
	 * 
	 * @param {array} roleNames array of names of roles
	 * @return {array} array of LicenseRoleDiscoveredData value objects with sys_id as the id
	 */
	lookupForRole: function(roleNames) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_user_role', roleNames);
		return this._collect(gr);
	},

	/**
	 * Lookup roles other than those in specified roleNames
	 * @param {array} array of role names
	 * @return {array} array of role names found in license_role_discovered which are not in given list
	 */
	lookupRolesOtherThan: function(roleNames) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_user_role', 'NOT IN', roleNames);
		gr.query();
		const names = new Set();
		while (gr.next())
			names.add(gr.name.toString());
		
		return [...names];
	},

	/**
	 * Lookup discovered role information for specified roleNames in specified states
	 * @param {array} roleNames array of roleNames
	 * @param {array} states array of enumerated values from choice list in license_role.state
	 * @return {array} array of LicenseRoleDiscoveredData value objects with sys_id as the id
	 */
	lookupForRolesByState: function(roleNames, states) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_user_role', roleNames);
		gr.addQuery('state', states.map(s => this.STATE_LABEL_MAP.get(s)));
		return this._collect(gr);
	},

	/**
	 * Lookup discovered role information with records in specified states
	 * @param {array} states array of enumerated values from choice list in license_role.state
	 * @return {array} array of LicenseRoleDiscoveredData value objects with sys_id as the id
	 */
	lookupByState: function(states) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('state', states.map(s => this.STATE_LABEL_MAP.get(s)));
		return this._collect(gr);
	},

	/**
	 * Lookup discovered role information with records not in specified states
	 * @param {array} states array of enumerated values from choice list in license_role.state
	 * @return {array} array of LicenseRoleDiscoveredData value objects with sys_id as the id
	 */
	lookupByStateOtherThan: function(states) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('state', 'NOT IN', states.map(s => this.STATE_LABEL_MAP.get(s)));
		return this._collect(gr);
	},

	/**
	 * Insert or update LicenseRoleDiscoveredData into a record in license_role_discovered table
	 * treating the id as sys_id for the record.
	 * @param {object} data an object of type LicenseRoleDiscoveredData
	 * @return {string} sys_id of record or null if there is an error
	 */
	insertOrUpdate: function(data) {
		const gr = new GlideRecord('license_role_discovered');
		// GlideRecord.insertOrUpdate is blocked in scoped apps
		let update = false;
		if (data.id) {
			if (gr.get(data.id))
				update = true;
			else
				gr.setNewGuidValue(data.id);
		}
		gr.name = data.roleName;
		gr.sys_user_role = data.roleName;
		gr.license_role_type = data.roleType;
		gr.category = data.isCustom ? 1 : 0;
		gr.state = this.STATE_LABEL_MAP.get(data.state);
		gr.reason = data.reason;
		gr.application = data.application;
		gr.scope = this._getScopeSysId(data.scope);
		if (update)
			gr.update();
		else
			gr.insert();
		return gr.getUniqueValue();
	},

	/**
	 * Delete records with specified ids
	 * @param {array} ids array of sys_ids
	 */
	deleteRecords: function(ids) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_id', ids);
		gr.deleteMultiple();
	},

	/**
	 * Delete records with specific ids that also match the category (custom | OOB)
	 * 
	 * @param {array} ids array of sys_ids
	 * @param {bool} isCustom true if deleting custom records, false if deleting OOB records
	 */
	deleteRecordsByCategory: function(ids, isCustom) {
		const category = isCustom ? 1 : 0; // 1 == custom; 0 == OOB

		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_id', ids);
		gr.addQuery('category', category);
		gr.deleteMultiple();
	},

	/**
	 * Set the state for records with specified ids to specified state
	 * @param {array} ids array of sys_ids
	 * @param {string} state one of enumerated values from choice list in license_role.state
	 */
	markState: function(ids, state) {
		const gr = new GlideRecord('license_role_discovered');
		gr.addQuery('sys_id', ids);
		gr.state = this.STATE_LABEL_MAP.get(state);
		gr.updateMultiple();
	},

	_collect: function(gr) {
		const data = [];
		gr.query();
		while (gr.next())
			data.push(this._mapToData(gr));
		return data;
	},

	_mapToData: function(gr) {
		return new LicenseRoleDiscoveredData(
			gr.getUniqueValue(),
			gr.sys_user_role.toString(),
			gr.license_role_type.toString(),
			gr.category.toString() === '1',
			this.STATE_VALUE_MAP.get(gr.state.toString()),
			(gr.getDisplayValue("reason") || ''),
			gr.application.toString(),
			gr.scope.scope.toString()
		);
	},

	/**
	 * Return the sys_id of sys_scope record corresponding to specified scope if present, else return null
	 * @param {string} the scope from sys_scope.scope
	 * @return {string} sys_id if scope can be found, else null
	 */
	_getScopeSysId: function(scope) {
		const gr = new GlideRecord('sys_scope');
		if (gr.get('scope', scope))
			return gr.getUniqueValue();
		return null;
	},

	type: 'LicenseRoleDiscoveredDao'
};
