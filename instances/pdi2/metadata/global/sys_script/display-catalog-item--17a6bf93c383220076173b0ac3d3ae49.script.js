(function executeRule(current, previous /*null when async*/) {
	if (current.inputs.catalog_item == "") {
		current.inputs.catalog_item = SCATFUtil.getLastUsedCatalogItemInTestBasedOnStep(current);
		if (!current.inputs.catalog_item) {
			if (current.step_config.category == '1d786c87c3b6220076173b0ac3d3ae16')
				gs.addInfoMessage(gs.getMessage("This step cannot be used before 'Open a Catalog Item' or 'Open a Record Producer' step. If contextual value has been used for 'Open a Catalog Item' or 'Open a Record Producer' in step before, set the 'Item' record in this step."));
			else if (current.step_config.category == '01245d698713030070870cf888cb0bfb')
				gs.addInfoMessage(gs.getMessage("This step cannot be used before 'Open a Catalog Item(SP)', 'Open a Record Producer(SP)' or 'Open an Order Guide (SP)' step. If contextual value has been used for 'Open a Catalog Item(SP)', 'Open a Record Producer(SP)' or 'Open an Order Guide (SP)' in step before, set the 'Item' record in this step."));
		}
	}
})(current, previous);
