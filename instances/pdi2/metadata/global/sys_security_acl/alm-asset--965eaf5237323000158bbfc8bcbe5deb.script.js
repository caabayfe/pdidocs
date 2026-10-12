if (GlidePluginManager.isActive('com.sn_eam')
	&& sn_eam.EAMUtils.allowAssetDelete
   && sn_eam.EAMUtils.isEnterpriseClassAsset(current.parent)) {
	answer = sn_eam.EAMUtils.allowAssetDelete(current);
} else if (GlidePluginManager.isActive('com.sn_hamp')
	&& sn_hamp.HAMUtils.allowAssetDelete) {
	answer = sn_hamp.HAMUtils.allowAssetDelete(current);
}
else {
	answer = true;
}
