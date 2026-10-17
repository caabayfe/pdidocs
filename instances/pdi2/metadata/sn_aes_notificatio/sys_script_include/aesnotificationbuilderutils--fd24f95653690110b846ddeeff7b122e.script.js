const AESNotificationBuilderUtils = Class.create();
AESNotificationBuilderUtils.prototype = {
    initialize: function() {
    },

	/**
     * Checks user `read` access to a table using ACLs
     * @param {string} tableName
     * @returns {boolean}
     */
	canReadTable: function(tableName) {

		if (gs.nil(tableName)) {
			return false;	
		}

		const table = new GlideRecord(tableName);

		if (!table.isValid()) {
			throw new sn_ws_err.ServiceError()
				.setStatus(404)
				.setMessage(gs.getMessage("The table you are checking privileges for does not exist."))
				.setDetail(gs.getMessage("The table you are checking privileges for - '{0}', does not exist.", tableName));
		}

		return table.canRead();
	},

    type: 'AESNotificationBuilderUtils'
};
