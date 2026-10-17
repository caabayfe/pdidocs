var KMFeedbackObjectBaseImpl = Class.create();
KMFeedbackObjectBaseImpl.prototype = {
    initialize: function() {
    },

    getFeedbackObject: function(gRecord, feedback_obj, version) {
		feedback_obj.article_number = gRecord.article.number+'';
		feedback_obj.short_desc = gRecord.article.short_description+'';
		feedback_obj.ownership_group = gRecord.article.ownership_group+'';
		feedback_obj.ownership_group_name = gRecord.article.ownership_group.getDisplayValue();
		feedback_obj.article_id = gRecord.article.sys_id+'';
		feedback_obj.comment = gRecord.comments+'';
		feedback_obj.commented_by = gRecord.user.getDisplayValue();
		feedback_obj.commented_on = gRecord.sys_created_on.getDisplayValue();
		feedback_obj.latest_version_id = version;
		feedback_obj.subject = "Reg: Article "+gRecord.article.number+ " has been commented on "+feedback_obj.commented_on;
    },

    type: 'KMFeedbackObjectBaseImpl'
};
