// As quantity received is mandatory for consumables of multiple quantity, check if 'quantity_received' is not empty
if(current.getValue('stage') === 'received' && parseInt(current.transfer_order_line.quantity_remaining) !== 1 && !(gs.nil(current.transfer_order_line.quantity_remaining)) && (current.transfer_order_line.model.sys_class_name.toString() === 'cmdb_consumable_product_model' ||  current.transfer_order_line.model.asset_tracking_strategy.toString() === 'track_as_consumable')){
	if(gs.nil(current.getValue('quantity_received'))){
		gs.addErrorMessage(gs.getMessage("Please provide quantity received to be received"));
		current.setAbortAction(true);
	}
}
