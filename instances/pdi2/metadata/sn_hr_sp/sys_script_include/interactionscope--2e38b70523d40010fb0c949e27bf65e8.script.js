var InteractionScope = Class.create();
InteractionScope.prototype = {
    initialize: function() {
    },
	
    getScopeForInteraction: function(interactionGr) {
		var preChatCategory = this._getPreChatCategory(interactionGr);
		if (preChatCategory) {
			var grCategoryQueue = new GlideRecord('sn_hr_sp_pre_chat');
			if (grCategoryQueue.isValid()) {
				if (!grCategoryQueue.get(preChatCategory)) {
					grCategoryQueue.initialize();
					grCategoryQueue.addQuery('pre_chat_category.display', preChatCategory);
					grCategoryQueue.setLimit(1);
					grCategoryQueue.query();
					if (!grCategoryQueue.next())
						return;
				}
				return grCategoryQueue.pre_chat_category.sys_scope.toString();
			}
		}
		return this._getScopeForTopic(interactionGr);
	},
	
	/* return true if this extension point is to be run */
	applies: function(interactionGr) {
		return this._getPreChatCategory(interactionGr) || this._getScopeForTopic(interactionGr);
	},
	
	_getPreChatCategory: function(interactionGr) {
		var grContext = new GlideRecord('interaction_context');
		grContext.addQuery('interaction', interactionGr.getUniqueValue());
		grContext.addQuery('name', 'liveagent_esc_pre_chat_category');
		grContext.query();
		if (grContext.next())
			return grContext.getValue('value');
		return null;
	},
	
	/* 
	 * If there is a VA topic related to the interaction, retrieve the scope
	 */
	_getScopeForTopic: function(interactionGr) {
		var grContext = new GlideRecord('interaction_context');
		grContext.addQuery('interaction', interactionGr.getUniqueValue());
		grContext.addQuery('name', 'liveagent_hr_topic_id');
		grContext.query();
		if (grContext.next()) {
			var grTopic = new GlideRecord('sys_cb_topic');
			if (grTopic.get(grContext.getValue('value')))
				return grTopic.getValue('sys_scope');
		}
		return null;
	},

    type: 'InteractionScope'
};
