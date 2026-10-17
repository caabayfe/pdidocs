if ('false' == cancelled) {
    var sourceAsset = new GlideRecord('alm_asset');
    sourceAsset.get(assetId);
    if (Number(sourceAsset.getValue('quantity')) > 1) {
        var asset = new GlideRecord(sourceAsset.sys_class_name);
        asset.model_category = sourceAsset.model_category;
        asset.model = sourceAsset.model;
        asset.stockroom = sourceAsset.stockroom;
        asset.location = sourceAsset.location;
        asset.managed_by = sourceAsset.managed_by;
        asset.cost = sourceAsset.cost;
        if (sourceAsset.parent.nil()) {
            asset.install_status = sourceAsset.install_status;
            asset.substatus = 'available';
        } else {
            // inherit parent's state upon allocation and set parent
            asset.install_status = sourceAsset.parent.install_status;
            asset.substatus = sourceAsset.parent.substatus;
            asset.parent = sourceAsset.parent;
        }
        asset.asset_tag = asset_tag;
		asset.serial_number = serial_number;
		asset.reserved_for = sys_user;
        var newAssetid = asset.insert();

        // decrement pre-allocated quantity
        if (!gs.nil(newAssetid)) {
            sourceAsset.quantity = sourceAsset.quantity - 1;
            sourceAsset.update();
			gs.addInfoMessage(gs.getEscapedMessage("Standalone asset got instantiated out of pre-allocated asset {0}", sourceAsset.display_name));
			response.sendRedirect('alm_asset.do?sys_id=' + newAssetid);
        } else {
			response.sendRedirect('alm_asset.do?sys_id=' + assetId);
		}  
    } else {
        if (sourceAsset.parent.nil()) {
            // update substatus to available because pre-allocated will prevent ci creation
            sourceAsset.substatus = 'available';
        } else {
            // inherit parent's state upon allocation
            sourceAsset.install_status = sourceAsset.parent.install_status;
            sourceAsset.substatus = sourceAsset.parent.substatus;
        }
        sourceAsset.asset_tag = asset_tag;
		sourceAsset.serial_number = serial_number;
		sourceAsset.reserved_for = sys_user;
        // create CI as needed
        try {
            (new AssetandCI()).createCI(sourceAsset);
			sourceAsset.update();
        } catch (err) {
            gs.addErrorMessage(err);
        }
		response.sendRedirect('alm_asset.do?sys_id=' + assetId);
    }
}
