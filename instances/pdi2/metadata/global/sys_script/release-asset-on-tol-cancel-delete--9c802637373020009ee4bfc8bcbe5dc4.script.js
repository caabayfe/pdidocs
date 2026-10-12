var grAsset = new GlideRecord('alm_asset');
if (grAsset.get(current.asset)) {
	grAsset.install_status = '6'; // in stock
	if (grAsset.substatus != 'pre_allocated' && grAsset.substatus != 'defective')
		grAsset.substatus = 'available';
	grAsset.active_to = false;
	// DEF0427166 - clearing reserved for field on Asset
	grAsset.reserved_for = '';
	grAsset.update();
}

if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management')) {
	if (!current.part_requirement.nil()) {
		var grPart = new GlideRecord('sm_part_requirement');
		if (grPart.get(current.part_requirement)) {
			grPart.sourced = false;
			grPart.update();
		}
	}
} else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management')) {
	if (!current.part_requirement.nil()) {
		var grPart = new GlideRecord('fsm_part_requirement');
		if (grPart.get(current.part_requirement)) {
			grPart.sourced = false;
			grPart.update();
		}
	}
}

if (current.operation() != "delete") {
	current.asset = "";
	current.quantity_requested = "0";
	current.quantity_remaining = "0";
}
