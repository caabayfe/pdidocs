populateReservedForField();

function populateReservedForField() {
	var asset = new GlideRecord('alm_asset');
	if(asset.get(current.asset)) {
		if(new AssetUtils().getAssetOrConsumable(asset.model) != 'consumable') {
			asset.reserved_for = current.request_line.request.requested_for;
			asset.update();
		}
	}
}
