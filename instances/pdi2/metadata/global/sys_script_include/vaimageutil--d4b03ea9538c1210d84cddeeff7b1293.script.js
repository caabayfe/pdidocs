var VAImageUtil = Class.create();
VAImageUtil.prototype = {

    initialize: function(channel) {
		const extensionPoints = new GlideScriptedExtensionPoint().getExtensions("VAImageExtPt");
		for (const extPt of extensionPoints) {
			if (extPt.handles(channel)) {
				this.imageUtil = extPt;
				return;
			}
		}
		this.imageUtil = new global.VADefaultImageUtil();
    },

	getDefaultCatItemImage: function (cardType, brandingKey) {
		return this.imageUtil.getDefaultCatItemImage(cardType, brandingKey);
	},

    type: 'VAImageUtil'
};
