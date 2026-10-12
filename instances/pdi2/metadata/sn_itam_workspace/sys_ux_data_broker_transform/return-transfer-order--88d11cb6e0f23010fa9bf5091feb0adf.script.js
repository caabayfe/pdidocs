function transform(input) {
    var isDefective = input.defective;
	var quantity = parseInt(input.quantity, 10);
    var rto = new global.TransferOrderReturn();
    var tol = new GlideRecord('alm_transfer_order_line');
    tol.get(input.sysId);
	var rtol = rto.returnItemsFromTransferOrderLine(tol, quantity, input.reason, isDefective);
	gs.addInfoMessage(gs.getMessage('Created return transfer order line'));
	return rtol.getValue('sys_id');
}
