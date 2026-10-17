var TopicPermissionClientUtilSNC = Class.create();
TopicPermissionClientUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	getParentTopicManagerAndContributor: function() {
		var topicPermissionUtil = new global.TopicPermissionUtil();
		var parentTopicSysId = this.getParameter('sysparm_parentTopicSysId');
		var result = topicPermissionUtil.getParentTopicManagerAndContributor(parentTopicSysId);
		return JSON.stringify(result);
	},
	
	isTaxonomyAdminOrManager: function() {
		taxonomySysId = this.getParameter('sysparm_taxonomySysId');
		var taxonomyGr = new GlideRecord('taxonomy');
		taxonomyGr.get(taxonomySysId);
		return this.hasTaxonomyWriteAccess(taxonomyGr);
	},

	/**
	 * checks the write access of current user in taxonomy record.
	 * @param GlideRecord taxonomy glide record
	 * @returns boolean returns if user has write access on the record.
	 */
	hasTaxonomyWriteAccess: function(taxonomyGr) {
		var answer = gs.hasRole("taxonomy_admin") || sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [taxonomyGr.managers]);
		return answer;
	},
	
	type: 'TopicPermissionClientUtilSNC'
});
