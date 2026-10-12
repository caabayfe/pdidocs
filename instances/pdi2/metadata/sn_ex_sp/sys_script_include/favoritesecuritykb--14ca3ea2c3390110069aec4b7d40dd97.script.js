var FavoriteSecurityKB = Class.create();
FavoriteSecurityKB.prototype = Object.extendsObject(FavoriteSecurityKBSNC, {
    initialize: function() {
		FavoriteSecurityKBSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'FavoriteSecurityKB'
});
