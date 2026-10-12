var CustomChatExperienceScripts = Class.create();
CustomChatExperienceScripts.prototype = {
    initialize: function() {
    },
	
	getPromotedTopicCount: function(profileId) {
		var gr = new GlideRecord("sys_cs_context_profile_promotion");
		gr.addQuery("context_profile", profileId);
		gr.query();
		return gr.getRowCount();
	},
	
	getPromotedTopicNameCount: function(profileId, name) {
		var gr = new GlideRecord("sys_cs_context_profile_promotion");
		gr.addQuery("context_profile", profileId);
		gr.addQuery("topic", name);
		gr.query();
		return gr.getRowCount();
	},
	
	getSetupTopicTypeCount: function(profileId, topicType) {
		var gr = new GlideRecord("sys_cs_context_profile_topic");
		gr.addQuery("context_profile", profileId);
		gr.addQuery("topic_type", topicType);
		gr.query();
		return gr.getRowCount();
	},
	
	getSearchMappingCount: function(profileId) {
		var gr = new GlideRecord("sys_cs_context_profile_search");
		gr.addQuery("context_profile", profileId);
		gr.query();
		return gr.getRowCount();
	},
	
	getSearchDomainMappingCount: function(profileId, domain) {
		var gr = new GlideRecord("sys_cs_context_profile_search");
		gr.addQuery("context_profile", profileId);
		gr.addQuery("sys_domain", domain);
		gr.query();
		return gr.getRowCount();
	},

	getSetupTopicTypeDomainCount: function(profileId, topicType, domain) {
		var gr = new GlideRecord("sys_cs_context_profile_topic");
		gr.addQuery("context_profile", profileId);
		gr.addQuery("topic_type", topicType);
		gr.addQuery("sys_domain", domain);
		gr.query();
		return gr.getRowCount();
	},

    type: 'CustomChatExperienceScripts'
};
