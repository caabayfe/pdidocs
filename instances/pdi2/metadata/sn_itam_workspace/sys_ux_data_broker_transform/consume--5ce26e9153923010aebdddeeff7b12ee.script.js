function transform(input){
	var consume_gr = new GlideRecord('alm_consumable');
	consume_gr.get(input.sysId);
	var totalQuantity = consume_gr.getValue('quantity');
	var quantity = input.quantity;
	var assetId = input.asset;
	var userId = input.user;
	
	var isValidQuantity = !gs.nil(quantity) && quantity >=1 && quantity <= totalQuantity;
	var isEitherPresent = !gs.nil(assetId) || !gs.nil(userId);
	
	if (!isValidQuantity) {
		gs.addErrorMessage(gs.getMessage("Quantity provided is not valid"));
		return;
	}
	
	if (!isEitherPresent) {
		gs.addErrorMessage(gs.getMessage("Asset/User is not provided to attach to the consumed items"));
		return;
	}
	
	if (assetId == "" && userId != "") {
		var gr = new GlideRecord('sys_user');
		gr.get(input.user);
		var location = gr.getValue('location');
		var userDetails= {
		cost_center: gr.getValue('cost_center'),
		department: gr.getValue('department'),
		company: gr.getValue('company'),
		};
		new global.Consumables().splitForeground(input.sysId, quantity, '10', '', assetId, '', location, userId, userDetails);
	} else if (assetId != "") {
		new global.Consumables().splitForeground(input.sysId, quantity, '10', '', assetId, '', '', userId);
	}
	return;
}
