function transform(input) {
	var consumableSysId = input.sysId;
	var quantity = input.quantity;
	var recGr = new GlideRecord('alm_consumable');
	if(recGr.get(consumableSysId)) {
		var isUpdateSuccessful = new global.Consumables().split(
			consumableSysId,
			quantity,
			6,
			input.substatus,
			recGr.parent,
			recGr.stockroom,
			recGr.location,
			recGr.assigned_to,
			input.assetFunction
		);
		if (isUpdateSuccessful) {
			if (quantity === '1') {
				gs.addInfoMessage(gs.getMessage('{0} asset has been split', quantity));
			} else {
				gs.addInfoMessage(gs.getMessage('{0} assets have been split', quantity));
			}
		}
	}
}
