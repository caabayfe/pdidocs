var QuickLinksCrudAPI = Class.create();
QuickLinksCrudAPI.prototype = Object.extendsObject(QuickLinksCrudAPISNC, {
	initialize: function() {
		QuickLinksCrudAPISNC.prototype.initialize.apply(this, arguments);
	},
	type: 'QuickLinksCrudAPI'
});
