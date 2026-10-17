autoChangeTOLState();

function autoChangeTOLState(){
	var fieldAgentTypeId = 'e2aa2b3f3763100044e0bfc8bcbe5dde'; 
    new TransferOrderReceiver().receiveAssets(current.sys_id, current.quantity_requested);
	if (current.transfer_order.from_stockroom.type == fieldAgentTypeId){
		new TransferOrderReceiver().setItemDelivered(current.sys_id);
	}
}
