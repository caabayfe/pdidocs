var VADefaultImageUtil = Class.create();
VADefaultImageUtil.prototype = {

	getDefaultCatItemImage: function (cardType, brandingKey) {
		if (cardType === 'CatalogCard' && brandingKey === 'polaris-dark') {
			return 'default-cart-icon-dark-mode.svg';
		} else {
			return 'default-cart-icon.svg';
		}
	},

    type: 'VADefaultImageUtil'
};
