pushStageFromTO();

function pushStageFromTO() {
	if(current.from_stockroom.sys_id == current.to_stockroom.sys_id) {
		var tol = new GlideRecord("alm_transfer_order_line");
		tol.addQuery('transfer_order', current.sys_id);
		tol.query();
		while(tol.next())
			autoReceiveTOL(tol);
	}
	else {
		var transferOrderStageHandler = new TransferOrderStageHandler();
		transferOrderStageHandler.pushStageFromTO(current,'requested');
	}
	action.setRedirectURL(current);
}

function autoReceiveTOL(tol) {
	var fieldAgentTypeId = 'e2aa2b3f3763100044e0bfc8bcbe5dde';
	new TransferOrderReceiver().receiveAssets(tol.sys_id, tol.quantity_requested);
	if (tol.transfer_order.from_stockroom.type == fieldAgentTypeId) {
		new TransferOrderReceiver().setItemDelivered(tol.sys_id);
	}
}
