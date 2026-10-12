function transform(input) {
    var updatedStockroom = input.currentStockroom;
	var actualStockroom = input.actualStockroom;
	var shouldUpdateStockroom = updatedStockroom === actualStockroom? actualStockroom: '';
	var status = 6;
	var substatus = input.substatus;
	var consumable = input.sysId;
	new global.Consumables().cancelFromDisposal(consumable, status, substatus, updatedStockroom, shouldUpdateStockroom);
}
