var MyAssetEntitlements = (function() {
	var MyAssetEntitlement = {};
 	MyAssetEntitlement.assetEntitlements = function() {
		var entitlementArray = [];
		new GlideQuery('alm_entitlement')
			.where('assigned_to', gs.getUserID())
			.orWhere('allocated_to.assigned_to', gs.getUserID())
			.select('sys_id')
			.forEach(function(entitlement) {
				entitlementArray.push(entitlement.sys_id);
			});
		return entitlementArray;
	};
	return MyAssetEntitlement;
}());
