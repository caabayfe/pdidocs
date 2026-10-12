var KnowledgeGuidanceUserResolver = Class.create();
KnowledgeGuidanceUserResolver.prototype = {
    initialize: function() {},

    /**
     * Returns an array of table names that this implementation supports.
     * 
     * Implementations of this extension point must override this method
     * to provide a BU-specific list of supported tables.
     * 
     * @returns {Array} An array of table names.
     */
    getSupportedTables: function() {
        return [];
    },

    /**
     * Retrieves the requestor information associated with a specific record for Knowledge Base access checks.
     * 
     * Implementations of this extension point must override this method
     * to implement BU-specific logic for determining the relevant requestors for a record.
     * 
     * @param {GlideRecord} currentRecordGr - GlideRecord of the record.
     * @returns {Object} Object containing:
     *   - userSysIds {Array<String>} - Array of user sys_ids to check for KB access.
     *   - requireAllUsersToHaveAccess {Boolean} - If true, all users must have access (AND logic).
     *                                             If false, only one user needs access (OR logic).
     */
    getUsersForKbAccessCheck: function(currentRecordGr) {
        return {
            userSysIds: [],
            requireAllUsersToHaveAccess: false
        };
    },

    /**
     * Returns the primary action identifier corresponding to the specified channel type.
     *
     * Implementations of this extension point must override this method
     * to implement BU-specific logic for determining the relevant primary action for a channel.
     * 
     * @param {String} channelType - The type of channel (e.g., 'email').
     * @returns {String} The primary action identifier for the given channel type.
     *
     */
    getPrimaryActionByChannel: function(channelType) {
        return '';
    },

    type: 'KnowledgeGuidanceUserResolver'
};
