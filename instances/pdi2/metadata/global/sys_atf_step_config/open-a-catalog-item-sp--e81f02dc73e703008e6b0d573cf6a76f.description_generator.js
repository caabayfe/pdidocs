function generateDescription() {
  	var query_params = JSON.parse(step.inputs.query_params || '{}');
	
	var itemName = step.inputs.catalog_item.getDisplayValue();
	var portalName = step.inputs.portal_id.getDisplayValue();
	
    var description = 'Open Catalog Item.';
	
	if(itemName && portalName) {
		description = 'Open "' + itemName + '" in the "' + portalName.trim() + '" portal';
	}
	
	var qp_str = '';
	
	for(var p in query_params) {
		if(query_params.hasOwnProperty(p)) {
			qp_str += p + " = " + query_params[p] + "\n";
		}
	}
	
	if(qp_str !== '') {
		description += " with the following query params:\n" + qp_str;
	}
	return description;
}
generateDescription();
