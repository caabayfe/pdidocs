// For tasks of stage = 'received', check if the consumable needs to be received in multiple quantity. If true then set 'quantity_received' to empty when the task is open
	if(current.getValue('stage') === 'received' && (current.transfer_order_line.model.sys_class_name.toString() === 'cmdb_consumable_product_model' ||  current.transfer_order_line.model.asset_tracking_strategy.toString() === 'track_as_consumable') && parseInt(current.getValue('state')) === 1){
	current.quantity_received = '';
	current.setWorkflow(false);
	current.update();
}
