var FavoriteSecurityKBSNC = Class.create();
FavoriteSecurityKBSNC.prototype = {
    initialize: function() {},

    /**
     * Return true if the favorite is visible on portal
     * @parm gr - GlideRecord - The original record that is favorited by the user
     * @return boolean
     */
    canView: function(gr, isMobile) {
        return gr.isValidRecord() && gr.canRead();
    },

    /**
     * Return true if this extension point is to be run
     * @return boolean
     */
    applies: function(gr) {
        return gr.getTableName() == 'kb_knowledge';
    },

    type: 'FavoriteSecurityKBSNC'
};
