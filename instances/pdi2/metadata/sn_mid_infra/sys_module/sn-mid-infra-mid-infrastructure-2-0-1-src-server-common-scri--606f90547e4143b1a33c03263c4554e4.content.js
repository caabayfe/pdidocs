var UserService = Class.create();
UserService.prototype = {
	initialize: function() {
		this.userUtility = new UserUtility();
	},

	/**
	 * Creates an active, internal-integration (machine-type) user and assigns the mid_server role.
	 *
	 * @param {string} userId - The user_name for the new user.
	 * @param {string} firstName - The first_name for the new user.
	 * @param {string} lastName - The last_name for the new user.
	 * @returns {GlideRecord} The newly created sys_user GlideRecord.
	 */
	createMIDServerUser: function(userId, firstName, lastName) {
		return this.userUtility.createMIDServerUser(userId, firstName, lastName);
	},

	/**
	 * Validates that a user is a valid MID server user.
	 * Checks that the user record exists, is active, is not locked out, and has the mid_server role.
	 *
	 * @param {string} userSysId - The sys_id of the sys_user record.
	 * @returns {boolean} true if all conditions are met; false otherwise.
	 */
	isValidMidUser: function(userSysId) {
		return this.userUtility.isValidMidUser(userSysId);
	},

	type: 'UserService'
};
