var canCloseTask = true;
	var isConsumableModel = current.transfer_order_line.model.sys_class_name.toString() === 'cmdb_consumable_product_model' ||  current.transfer_order_line.model.asset_tracking_strategy.toString() === 'track_as_consumable';
	if (current.getValue('stage') === 'received' && isConsumableModel) {
		// Only for consumables, wait until all consumables are received to close the task
		var remQty = current.transfer_order_line.quantity_remaining;
		remQty = gs.nil(remQty) ? '' : remQty.toString();
		var recQty = current.quantity_received;
		recQty = gs.nil(recQty) ? '' : recQty.toString();
		if (remQty !== '1' && recQty !== remQty) {
			canCloseTask = false;
		}
	}
	if(canCloseTask){
		current.state = 3;
	}
	if (global.AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.ITAMCommonPalletsUtil) {
		if(current.getValue('stage') === 'requested' && !gs.nil(current.transfer_order_line.asset.parent) ){
			//whether new asset is part of a pallet
			var isPallet = global.AssetUtils.isParentPallet(current.transfer_order_line.asset.parent.sys_id);

			if(isPallet == true){
				//call script include to remove child parent relationship
				sn_itam_common.ITAMCommonPalletsUtil.removeAssetFromPallet(current.transfer_order_line.asset.sys_id);
			}
		}
	}
	current.update();
