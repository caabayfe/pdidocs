var FavoriteSecurityCatalog = Class.create();
FavoriteSecurityCatalog.prototype = Object.extendsObject(FavoriteSecurityCatalogSNC, {
    initialize: function() {
		FavoriteSecurityCatalogSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'FavoriteSecurityCatalog'
});
