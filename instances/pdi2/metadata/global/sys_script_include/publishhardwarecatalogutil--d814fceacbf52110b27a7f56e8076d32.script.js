var PublishHardwareCatalogUtil = Class.create();
PublishHardwareCatalogUtil.prototype = {
	initialize: function() {},

	isEligibleProductModel: function(sysClassName) {
		if (sysClassName === 'cmdb_hardware_product_model' || sysClassName === 'cmdb_consumable_product_model') {
			return true;
		}

		// eslint-disable-next-line
		if (GlidePluginManager.isActive('com.app-ni-core') && sn_ni_core.TNIAssetUtil) {
			// eslint-disable-next-line
			return new sn_ni_core.TNIAssetUtil().isValidModelForPublishingPrdCatalog(sysClassName);
		}
		return false;
	},

	type: 'PublishHardwareCatalogUtil',
};
