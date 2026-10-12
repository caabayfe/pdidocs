var SidebarGroupMemberResolver = Class.create();
SidebarGroupMemberResolver.prototype = {
    initialize: function() {},

    /** 
        @param groupId  - sys_id of sys_user_group record for which members are to be resolved.
    	@param documentId - sys_id of the document on which Sidebar discussion is being initiated.
    	@param documentTable - name of the document table.
		@return true if this extension point is to be run for the given inputs
    */
    applies: function(groupId, documentId, documentTable) {
        /* custom implementation goes here */
    },

    /**
        @param groupId  - sys_id of sys_user_group record for which members are to be resolved.
    	@param documentId - sys_id of the document on which Sidebar discussion is being initiated.
    	@param documentTable - name of the document table.
		@return list of sys_ids of resolved participants for the given inputs
    */
    getResolvedMembers: function(groupId, documentId, documentTable) {
        /* custom implementation goes here */
    },

    /**
        @param groupId  - sys_id of sys_user_group record for which members are to be resolved.
    	@param documentId - sys_id of the document on which Sidebar discussion is being initiated.
    	@param documentTable - name of the document table.
		@return system message that would be added to the initial system message which is sent in the discussion window 
		For Example : On-Call members of Hardware joined the discussion.
		System message should contain information of the resolved members example on-call, group name example Hardware followed by
		the string 'joined the discussion'.
		
    */
    getSystemMessage: function(groupId, documentId, documentTable) {
        /* custom implementation goes here */
    },

    type: 'SidebarGroupMemberResolver'
};
