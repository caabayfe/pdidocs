(function() {
	var contract = new GlideRecord("cmdb_contract_product_model");
	contract.setWorkflow(false);

	// For zboot set attach_sla true for Service Contract
	// Otherwise set all to true to preserve behaviour for upgrading customers
	if (pm.isZboot()) {
		if (contract.get("8881e836c3102000b959fd251eba8f29")) {
			contract.attach_sla = true;
			contract.update();
		}
	} else {
		contract.query();
		while (contract.next()) {
			contract.attach_sla = true;
			contract.update();
		}
	}
})();
