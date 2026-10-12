var FavoriteSecurityTopicSNC = Class.create();
FavoriteSecurityTopicSNC.prototype = {
    initialize: function() {
    },

	/**
     * Return true if the favorite is visible on portal
     * @parm gr - GlideRecord - The original record that is favorited by the user
     * @return boolean
     */
    canView: function(gr, isMobile) {
        return new TopicSecurityUtil().checkTopicAccessForCurrentUser(gr, isMobile);
    },

    /**
     * Return true if this extension point is to be run
     * @return boolean
     */
    applies: function(gr) {
        return gr.getTableName() == 'topic';
    },

    type: 'FavoriteSecurityTopicSNC'
};
