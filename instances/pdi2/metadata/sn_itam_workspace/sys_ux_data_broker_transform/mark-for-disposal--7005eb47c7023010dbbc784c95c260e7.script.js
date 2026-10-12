function transform(input) {
    var updatedQuantity = input.quantity;
	var consumableSysId = input.sysId;
	var totalQuantity = input.consQty;

	if (updatedQuantity > totalQuantity) {
		gs.addErrorMessage(gs.getMessage("Please enter a quantity less than or equal to the total quantity"));
	} else {
		new global.Consumables().markReadyForDisposal(consumableSysId, updatedQuantity, '6', 'pending_disposal');
	}
}
