var SPFavoriteSecurity = Class.create();
SPFavoriteSecurity.prototype = {
    initialize: function() {
    },
	
	/* return if the record is visible in the protal */
    canView: function(/*GlideRecord*/ gr, /*SysID*/portalID) {
    },
	
	/* return true if this extension point is to be run */
	applies: function(/*GlideRecord*/ gr) {
	},

    type: 'SPFavoriteSecurity'
};
