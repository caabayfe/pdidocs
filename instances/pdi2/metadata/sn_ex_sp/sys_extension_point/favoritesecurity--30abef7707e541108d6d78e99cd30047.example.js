var FavoriteSecurity = Class.create();
FavoriteSecurity.prototype = {
    initialize: function() {},

    /**
     * Return true if the favorite is visible on portal
     * @parm gr - GlideRecord - The original record that is favorited by the user
     * @return boolean
     */
    canView: function(gr, isMobile) {
        return false;
    },

    /**
     * Return true if this extension point is to be run
     * @return boolean
     */
    applies: function(gr) {
        return false;
    },

    type: 'FavoriteSecurity'
};
