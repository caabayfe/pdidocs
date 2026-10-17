var GlobalGlideappCatalogURLGenerator = Class.create();
GlobalGlideappCatalogURLGenerator.prototype = {
    initialize: function() {
    },

	getItemBaseURLFromGR(gr) {
		return global.GlideappCatalogURLGenerator.getItemBaseURLFromGR(gr);
	},

    type: 'GlobalGlideappCatalogURLGenerator'
};
