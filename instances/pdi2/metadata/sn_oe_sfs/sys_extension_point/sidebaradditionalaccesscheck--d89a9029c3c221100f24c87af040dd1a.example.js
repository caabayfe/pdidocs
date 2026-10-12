var SidebarAdditionalAccessCheck = Class.create();
SidebarAdditionalAccessCheck.prototype = {
    initialize: function() {
    },

	/**
	 * @param documentTable table of the sidebar chat base record
	 * @param documentId sys id of the sidebar chat base record
	 * @return if user has write access to the sidebar chat
	 */
    canWrite: function(documentTable, documentId) {
        return true;
    },

	/**
	 * @param collabChatSysId sys id of the collab chat
	 * @param documentTable table of the sidebar chat base record
	 * @param documentId sys id of the sidebar chat base record
	 * @return if user has read access to the sidebar chat
	 */
	canRead: function(collabChatSysId, documentTable, documentId) {
        return true;
    },

    type: 'SidebarAdditionalAccessCheck'
};
