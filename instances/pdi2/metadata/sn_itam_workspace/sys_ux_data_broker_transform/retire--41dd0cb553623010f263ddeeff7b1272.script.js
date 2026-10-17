function transform(input) {
    var updatedQuantity = input.quantity;
	var consumableSysId = input.sysId;
	var stockroom = input.stockroom;
	var substate = input.substate;
	new global.Consumables().retireConsumable(consumableSysId, updatedQuantity, '6', substate, stockroom);
}
