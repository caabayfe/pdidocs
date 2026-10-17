if (!current.stockroom.nil())
	current.location = current.stockroom.location;
else if (!current.assigned_to.nil() && !current.assigned_to.location.nil()){
	if (GlidePluginManager.isActive('sn_eam') && current.operation() === 'update') {
		if (!sn_itam_common.AssetOnboardingCommonUtils.isAssetPartOfOnboardingFlow(previous)) {
			current.location = current.assigned_to.location;
		}
	} else {
		current.location = current.assigned_to.location;
	}
}
