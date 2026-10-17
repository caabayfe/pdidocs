var UserUtility = Class.create();
UserUtility.prototype = {
	TABLE_SYS_USER: 'sys_user',
	TABLE_SYS_USER_HAS_ROLE: 'sys_user_has_role',
	FIELD_USER_NAME: 'user_name',
	FIELD_LOCKED_OUT: 'locked_out',
	FIELD_USER: 'user',
	FIELD_ROLE: 'role',
	FIELD_ROLE_NAME: 'role.name',
	TABLE_SYS_USER_ROLE: 'sys_user_role',
	TABLE_SYS_USER_ROLE_CONTAINS: 'sys_user_role_contains',
	ROLE_MID_SERVER: 'mid_server',

	initialize: function() {
		this.validationUtil = new ValidationUtility();
	},

	/**
	 * Validate a user by user_name, optionally checking for required roles and locked status.
	 *
	 * Behavior:
	 * - Looks up the user by exact user_name.
	 * - If validateLockedOpt is true, the user must not be locked_out.
	 * - If rolesOpt is provided, the user must have all listed roles.
	 *
	 * @param {string} userName - The user's user_name to validate. Must be a string.
	 * @param {string[]} [rolesOpt] - Optional list of required role names. When provided, must be an array of non-empty strings.
	 * @param {boolean} [validateLockedOpt] - Optional flag. If true, also validate that the user is not locked_out.
	 * @returns {GlideRecord|null} The validated sys_user GlideRecord when all validations pass; null otherwise.
	 * @throws {InvalidValueError} When userName is not a string, or rolesOpt is provided but is not an array of non-empty strings.
	 */
	getValidateUser: function (userName, rolesOpt, validateLockedOpt) {
		var userGr = this.getByUserName(userName);
		if (!userGr) return null;

		if (validateLockedOpt && this.isLockedOut(userGr)) return null;

		if (!this.hasRoles(userGr, rolesOpt)) return null;

		return userGr;
	},

	/**
	 * Gets a user by their user_name.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userName is not a string.
	 * - Allows empty strings and strings with only spaces.
	 *
	 * @param {string} userName - The user_name of the user to find.
	 * @returns {GlideRecord|null} The sys_user GlideRecord if found; otherwise, null.
	 */
	getById: function(sysId) {

		if (!this.validationUtil.validateNonEmptyString(sysId, 'sysId', false)) 
			return null;

		var userGr = new GlideRecord(this.TABLE_SYS_USER);
		userGr.addQuery('sys_id', sysId)
		userGr.query();
		if (userGr.next()) {
			return userGr;
		}

		return null;
	},

	getByUserName: function (userName) {
		this.validationUtil.validateString(userName, 'userName', true);

		// Return null early for null/undefined since we can't query with these
		if (userName == null) {
			return null;
		}

		var userGr = new GlideRecord(this.TABLE_SYS_USER);
		userGr.addQuery(this.FIELD_USER_NAME, userName);
		userGr.setLimit(1);
		userGr.query();

		if (userGr.next()) return userGr;

		return null;
	},

	/**
	 * Validates that a user is a valid MID server user.
	 * Checks that the user record exists, is active, is not locked out, and has the mid_server role.
	 *
	 * @param {string} userSysId - The sys_id of the sys_user record.
	 * @returns {boolean} true if all conditions are met; false otherwise.
	 */
	isValidMidUser: function(userSysId) {
		var userGr = this.getById(userSysId);
		if (!userGr) return false;

		if (!userGr.active) return false;

		if (this.isLockedOut(userGr)) return false;

		return this.hasRoles(userGr, [this.ROLE_MID_SERVER]);
	},

	/**
	 * Checks if a user is locked out.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userGr is not a sys_user GlideRecord with a valid sys_id.
	 *
	 * @param {GlideRecord} userGr - The sys_user GlideRecord.
	 * @returns {boolean} True if the user is locked out; otherwise, false.
	 */
	isLockedOut: function (userGr) {
		// Validate input is a sys_user GlideRecord with a valid sys_id
		this.validationUtil.validateGlideRecord(userGr, 'sys_user', 'userGr', true);
		return userGr.locked_out;
	},

	/**
	 * Gets all roles assigned to a user, including inherited subroles.
	 * This function works in scoped apps by directly querying database tables.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userSysId is not a non-empty string.
	 *
	 * Behavior:
	 * - Gets all directly assigned roles from sys_user_has_role table.
	 * - Recursively gets all subroles from sys_role_includes table.
	 * - Validates that role records exist using utility.
	 * - Returns a Set object containing all role names for efficient lookup.
	 *
	 * @param {string} userSysId - The sys_id of the user to get roles for.
	 * @returns {Set} A Set containing all role names (direct and inherited).
	 */
	getUserRolesWithSubroles: function(userSysId) {
		// Validate input is a non-empty string
		this.validationUtil.validateNonEmptyString(userSysId, 'userSysId', true);
		
		var allRoles = new Set();
		
		// Get directly assigned roles
		var userRoleGr = new GlideRecord(this.TABLE_SYS_USER_HAS_ROLE);
		userRoleGr.addQuery(this.FIELD_USER, userSysId);
		userRoleGr.query();
		
		while (userRoleGr.next()) {
			var roleSysId = userRoleGr.getValue(this.FIELD_ROLE);
			var roleGr = new GlideRecord(this.TABLE_SYS_USER_ROLE);
			roleGr.addQuery('sys_id', roleSysId);
			roleGr.query();
			if (roleGr.next()) {
				
				var roleName = roleGr.getValue('name');
				if (roleName) {
					allRoles.add(roleName);
					// Get subroles for this role
					this._getSubRoles(roleSysId, allRoles);
				}
			}
		}
		
		return allRoles;
	},

	/**
	 * Private helper method to recursively get subroles.
	 *
	 * @param {string} roleSysId - The sys_id of the role to get subroles for.
	 * @param {Set} allRoles - The Set to add subroles to.
	 */
	_getSubRoles: function(roleSysId, allRoles) {
		var roleIncludesGr = new GlideRecord(this.TABLE_SYS_USER_ROLE_CONTAINS);
		roleIncludesGr.addQuery('role', roleSysId);
		roleIncludesGr.query();
		
		while (roleIncludesGr.next()) {
			var subRoleSysId = roleIncludesGr.getValue('contains');
			var subRoleGr = new GlideRecord(this.TABLE_SYS_USER_ROLE);
			subRoleGr.addQuery('sys_id', subRoleSysId);
			subRoleGr.query();
			if (subRoleGr.next()) {
				var subRoleName = subRoleGr.getValue('name');
				if (subRoleName && !allRoles.has(subRoleName)) {
					allRoles.add(subRoleName);
					// Recursively get subroles of this subrole
					this._getSubRoles(subRoleSysId, allRoles);
				}
			}
		}
	},

	/**
	 * Checks if a user has a given set of roles.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userGr is not a sys_user GlideRecord with a valid sys_id.
	 * - Throws InvalidValueError when rolesOpt is provided (non-null/undefined) and is not an array.
	 * - Throws InvalidValueError when any entry in rolesOpt is not a non-empty string (after trimming).
	 *
	 * Behavior:
	 * - If rolesOpt is undefined, null, or an empty array, returns true (no required roles).
	 * - Otherwise, normalizes/validates each role name and requires them all to be present.
	 * - Uses getUserRolesWithSubroles which works in scoped apps.
	 *
	 * @param {GlideRecord} userGr - The sys_user GlideRecord.
	 * @param {string[]} [rolesOpt] - Optional array of role names to check.
	 * @returns {boolean} True if the user has all specified roles, or if no roles are specified; otherwise, false.
	 */
	hasRoles: function (userGr, rolesOpt) {
		// Validate userGr is a sys_user GR with valid sys_id
		this.validationUtil.validateGlideRecord(userGr, 'sys_user', 'userGr', true);

		// Validate rolesOpt is an array of non-empty strings (when provided)
		if (rolesOpt != null && !Array.isArray(rolesOpt)) throw new InvalidValueError('Invalid value for rolesOpt: must be an array of non-empty strings');

		// If undefined, null, or empty array => no required roles
		if (!rolesOpt || rolesOpt.length === 0) return true;

		var roles = [];
		for (var i = 0; i < rolesOpt.length; i++) {
			var roleNameIn = rolesOpt[i];
			this.validationUtil.validateNonEmptyString(roleNameIn, 'rolesOpt[' + i + ']', true);
			roles.push(roleNameIn.trim());
		}

		// Get all user roles including subroles
		var userRoles = this.getUserRolesWithSubroles(userGr.getValue('sys_id'));
		
		// Check if user has all required roles
		for (var j = 0; j < roles.length; j++) {
			if (!userRoles.has(roles[j]))
				return false;
		}

		return true;
	},

	/**
	 * Checks if a user has any of the given roles, including inherited roles.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userGr is not a sys_user GlideRecord with a valid sys_id.
	 * - Throws InvalidValueError when rolesOpt is provided but not an array of non-empty strings.
	 *
	 * Behavior:
	 * - If rolesOpt is undefined, null, or an empty array, returns false (no roles to check).
	 * - Otherwise, normalizes/validates each role name and checks if user has ANY of them.
	 * - Uses getUserRolesWithSubroles which works in scoped apps.
	 *
	 * @param {GlideRecord} userGr - The sys_user GlideRecord.
	 * @param {string[]} [rolesOpt] - Optional array of role names to check.
	 * @returns {boolean} True if the user has any of the specified roles (directly or inherited); otherwise, false.
	 */
	hasAnyRole: function (userGr, rolesOpt) {
		// Validate userGr is a sys_user GR with valid sys_id
		this.validationUtil.validateGlideRecord(userGr, 'sys_user', 'userGr', true);

		// Validate rolesOpt is an array of non-empty strings (when provided)
		if (rolesOpt != null && !Array.isArray(rolesOpt)) throw new InvalidValueError('Invalid value for rolesOpt: must be an array of non-empty strings');

		// If undefined, null, or empty array => return false (no roles to check)
		if (!rolesOpt || rolesOpt.length === 0) return false;

		var roles = [];
		for (var i = 0; i < rolesOpt.length; i++) {
			var roleNameIn = rolesOpt[i];
			this.validationUtil.validateNonEmptyString(roleNameIn, 'rolesOpt[' + i + ']', true);
			roles.push(roleNameIn.trim());
		}

		// Get all user roles including subroles
		var userRoles = this.getUserRolesWithSubroles(userGr.getValue('sys_id'));
		
		// Check if user has any of the required roles
		for (var j = 0; j < roles.length; j++) {
			if (userRoles.has(roles[j]))
				return true;
		}

		return false;
	},

	/**
	 * Creates an active, internal-integration (machine-type) user and assigns the mid_server role.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userId, firstName, or lastName is not a non-empty string.
	 *
	 * Behavior:
	 * - Throws Error if the GlideRecord insert fails (e.g., duplicate user_name or ACL denial).
	 * - Calls {@link UserUtility#assignRoles} with ignoreInvalidRole=true, which logs a warning
	 *   and skips if the mid_server role does not exist rather than throwing.
	 * - If role assignment fails for any other reason, the error propagates. The created user
	 *   is not deleted because scoped apps do not have delete privileges on sys_user.
	 *
	 * @param {string} userId - The user_name for the new user.
	 * @param {string} firstName - The first_name for the new user.
	 * @param {string} lastName - The last_name for the new user.
	 * @returns {GlideRecord} The newly created sys_user GlideRecord.
	 * @throws {InvalidValueError} If userId, firstName, or lastName is not a non-empty string.
	 * @throws {Error} If the user record insert fails.
	 */
	createMIDServerUser: function (userId, firstName, lastName) {
		this.validationUtil.validateNonEmptyString(userId, 'userId', true);
		this.validationUtil.validateNonEmptyString(firstName, 'firstName', true);
		this.validationUtil.validateNonEmptyString(lastName, 'lastName', true);

		var userGr = new GlideRecord(this.TABLE_SYS_USER);
		userGr.initialize();
		userGr.setValue(this.FIELD_USER_NAME, userId);
		userGr.setValue('first_name', firstName);
		userGr.setValue('last_name', lastName);
		userGr.setValue('active', true);
		userGr.setValue('internal_integration_user', true);
		userGr.setValue('identity_type', 'machine');
		var userSysId = userGr.insert();

		if (!userSysId)
			throw new Error('Failed to create user: ' + userId + ". Last error: " + userGr.getLastErrorMessage()());

		this.assignRoles(userSysId, [this.ROLE_MID_SERVER], true);
		// apps cannot delete users so we can do nothing if there are failure in it

		return userGr;
	},

	/**
	 * Assigns a list of roles to a user.
	 *
	 * Validation:
	 * - Throws InvalidValueError when userSysId is not a valid 32-character sys_id.
	 * - Throws InvalidValueError when roles is not a non-empty array of non-empty strings.
	 * - Throws InvalidValueError when ignoreInvalidRole is not a boolean.
	 * - When ignoreInvalidRole is true, logs a warning and skips any role name that does not exist in sys_user_role.
	 * - When ignoreInvalidRole is false, throws InvalidValueError listing all role names that do not exist in sys_user_role.
	 *
	 * Behavior:
	 * - Does not create duplicate sys_user_has_role entries; existing user/role links are skipped.
	 * - Throws Error if a sys_user_has_role insert fails (e.g., ACL denial or database error).
	 *
	 * @param {string} userSysId - The sys_id of the user to assign roles to.
	 * @param {string[]} roles - Array of role names to assign.
	 * @param {boolean} ignoreInvalidRole - When true, warns and skips non-existent roles. When false, throws InvalidValueError listing all non-existent roles.
	 * @throws {InvalidValueError} If userSysId, roles, or ignoreInvalidRole fails validation,
	 *   or if ignoreInvalidRole is false and any role names do not exist in sys_user_role.
	 * @throws {Error} If a sys_user_has_role record insert fails.
	 */
	assignRoles: function (userSysId, roles, ignoreInvalidRole) {
		this.validationUtil.validateSysId(userSysId, 'userSysId', true);
		this.validationUtil.validateNonEmptyStringArray(roles, 'roles', true);
		this.validationUtil.validateBoolean(ignoreInvalidRole, 'ignoreInvalidRole', true);

		// Pass 1: Validate all roles and collect valid role sys_ids
		var validRoles = [];
		var invalidRoles = [];

		for (var i = 0; i < roles.length; i++) {
			var roleName = roles[i].trim();

			var roleGr = new GlideRecord(this.TABLE_SYS_USER_ROLE);
			roleGr.addQuery('name', roleName);
			roleGr.setLimit(1);
			roleGr.query();
			if (!roleGr.next()) {
				if (ignoreInvalidRole) {
					gs.warn('assignRoles: Role not found: ' + roleName + '. Skipping.');
				} else {
					invalidRoles.push(roleName);
				}
				continue;
			}

			validRoles.push(roleGr.getUniqueValue());
		}

		if (invalidRoles.length > 0)
			throw new InvalidValueError('assignRoles: Invalid roles not found in sys_user_role: ' + invalidRoles.join(', '));

		// Pass 2: Assign validated roles, skipping duplicates
		for (var j = 0; j < validRoles.length; j++) {
			var roleSysId = validRoles[j];

			var existing = new GlideRecord(this.TABLE_SYS_USER_HAS_ROLE);
			existing.addQuery(this.FIELD_USER, userSysId);
			existing.addQuery(this.FIELD_ROLE, roleSysId);
			existing.setLimit(1);
			existing.query();
			if (existing.next())
				continue;

			var hasRoleGr = new GlideRecord(this.TABLE_SYS_USER_HAS_ROLE);
			hasRoleGr.initialize();
			hasRoleGr.setValue(this.FIELD_USER, userSysId);
			hasRoleGr.setValue(this.FIELD_ROLE, roleSysId);
			if (!hasRoleGr.insert()) {
				throw new Error('assignRoles: Failed to assign role ' + roleSysId + ' to user ' + userSysId + '. Last error: ' + hasRoleGr.getLastErrorMessage());
			}
		}
	},

	type: 'UserUtility'
};
