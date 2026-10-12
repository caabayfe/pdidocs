var LicenseRoleDiscoveredData = Class.create();
LicenseRoleDiscoveredData.prototype = {
	/**
	 * Construct a value object representing a discovered license role.
	 * The fields can be accessed as properties directly.
	 * 
	 * @param {string} id GUID identifier, which can be null based on source/persisted state
	 * @param {string} roleName the name of the role
	 * @param {string} roleType the enumerated role type name from license_role_type.name
	 * @param {boolean} isCustom true if role is a custom role, false otherwise
	 * @param {string} state enumerated value from choice list in license_role.state
	 * @param {string} reason for role type categorization display value
	 * @param {string} application id of application in license_family, should match the family_id column
	 * @param {string} scope name of the scope in sys_scope 
	 */
    initialize: function(id, roleName, roleType, isCustom, state, reason, application, scope) {
		this.id = id;
		this.roleName = roleName;
		this.roleType = roleType;
		this.isCustom = isCustom;
		this.state = state;
		this.reason = reason;
		this.application = application;
		this.scope = scope;
    },

	
    type: 'LicenseRoleDiscoveredData'
};
