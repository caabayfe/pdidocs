function transform(input) {
    var assetTag = input.paramsJSON.asset_tag;
    var serialNumber = input.paramsJSON.serial_number;
    var reservedFor = input.paramsJSON.reserved_for;
    var sourceAsset = new GlideRecord('alm_asset');
    sourceAsset.get(input.sysId);
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
        asset.asset_tag = assetTag;
        asset.serial_number = serialNumber;
        asset.reserved_for = reservedFor;
        var newAssetid = asset.insert();

        // decrement pre-allocated quantity
        if (!gs.nil(newAssetid)) {
            sourceAsset.quantity = sourceAsset.quantity - 1;
            sourceAsset.update();
            gs.addInfoMessage(gs.getMessage("Standalone asset got instantiated out of pre-allocated asset {0}", sourceAsset.display_name));
            return newAssetid;
        } else {
            return null;
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
        sourceAsset.asset_tag = assetTag;
        sourceAsset.serial_number = serialNumber;
        sourceAsset.reserved_for = reservedFor;
        // create CI as needed
        try {
            (new global.AssetandCI()).createCI(sourceAsset);
            sourceAsset.update();
        } catch (err) {
            gs.addErrorMessage(err);
        }
        return null;
    }
}
