var VATeamsImageUtil = Class.create();

VATeamsImageUtil.prototype = Object.extendsObject(global.VADefaultImageUtil, {

    handles: function (channel) {
		return channel === 'Teams';
	},

	getDefaultCatItemImage: function (cardType, brandingKey) {
		return 'default-cart-icon.png';
	},

    type: 'VATeamsImageUtil'
});
