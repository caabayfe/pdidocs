function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || (g_form.getValue('from_stockroom') == '' && (g_scratchpad.isPartRequirementColumnPresent && g_form.getValue('part_requirement') != ''))) {
		return;
	}
	var quantity_requested = g_form.getDecimalValue('quantity_requested'); //Changed for DEF0322911
	//quantity_requested = parseInt(quantity_requested.replace(/[^0-9-.]/g,''), 10); //Replacing all characters except digits #DEF0318697=
	if (quantity_requested == 0)
		return;
	if (quantity_requested < 0) {
		g_form.setValue('quantity_requested', 0);
		return;
	}
	var transferOrder = undefined;
	var partRequirement = undefined;
	var asset = undefined;
	var toFetched = false;
	var assetFetched = false;
	var partFetched = false;

	function updateRecord() {

		if (!toFetched || !assetFetched || !partFetched)
			return;

		var fromStockroom = "";
		if (g_form.getValue('transfer_order') != '')
			fromStockroom = transferOrder.from_stockroom;
		else
			fromStockroom = g_form.getValue('from_stockroom');

		// Verify we have enough stock to cover the order
		var used_qty = 0;

		if (asset && asset.quantity != undefined)
			used_qty = parseInt(asset.quantity, 10);

		asset = new GlideRecord('alm_consumable');
		asset.addQuery('stockroom', fromStockroom);
		asset.addQuery('install_status', '6');
		asset.addQuery('substatus', 'available');
		asset.addQuery('model', g_form.getValue('model'));
		var qty = 0;
		asset.query(callback);

		function callback(asset) {
			if (asset.next()) {
				qty = asset.quantity;
			}
			var total_qty = (parseInt(qty, 10) + parseInt(used_qty, 10));
			//quantity_requested = parseInt(g_form.getValue('quantity_requested'), 10); //Commented redundant code #DEF0318697
			if (partRequirement != undefined) {
				// If the TOL has a PR then 'quantity_requested' should depend on
				// the PR.required_quantity and the stockroom availability
				if (g_form.isNewRecord()) {
					// Its a new record and oldValue is automatically set to 1. We dont
					// need to
					// take account of this value because this amount has not been
					// requested yet.
					// We need to consider how much have already been requested and
					// based on that,
					// be able to figure out how many more are allowed to order from
					// this TOL.
					// So assume oldValue as 0.
					oldValue = 0;
				}

				var needToRequest = partRequirement.required_quantity - (partRequirement.reserved_quantity - oldValue);

				if (quantity_requested > needToRequest) {
					if (typeof(g_aw) !== 'undefined') {
						getMessage('Quantity cannot exceed Part requirement quantity: resetting quantity to fulfill this Part requirement ({0})', needToRequest, function(message) {
							g_form.addErrorMessage(message);
						});
					} else {
						g_form.addErrorMessage(formatMessage(
							getMessage('Quantity cannot exceed Part requirement quantity: resetting quantity to fulfill this Part requirement ({0})'),
							needToRequest));
					}
					g_form.setValue('quantity_requested', needToRequest);
				} else if (quantity_requested > total_qty) {
					if (typeof(g_aw) !== 'undefined') {
						getMessage('Not enough stock to satisfy request: resetting quantity to max available ({0})', total_qty, function(message) {
							g_form.addErrorMessage(message);
						});
					} else {
						g_form.addErrorMessage(formatMessage(
							getMessage('Not enough stock to satisfy request: resetting quantity to max available ({0})'), total_qty));
					}
					g_form.setValue('quantity_requested', total_qty);
				}

			} else {
				// If the TOL doesn't have a PR then 'quantity_requested'
				// should depend only on stockroom availability

				if (quantity_requested > total_qty) {
					if (typeof(g_aw) !== 'undefined') {
						getMessage('Not enough stock to satisfy request: resetting quantity to max available ({0})', total_qty, function(message) {
							g_form.addErrorMessage(message);
						});
					} else {
						g_form.addErrorMessage(formatMessage(
							getMessage('Not enough stock to satisfy request: resetting quantity to max available ({0})'), total_qty));
					}
					g_form.setValue('quantity_requested', total_qty);
				}
			}
		}
	}
	g_form.getReference('transfer_order', function(value) {
		toFetched = true;
		transferOrder = value;
		updateRecord();
	});
	g_form.getReference('asset', function(value) {
		assetFetched = true;
		asset = value;
		updateRecord();
	});
	if (g_form.getValue('part_requirement') === '') {
		partFetched = true;
		updateRecord();
	} else {
		g_form.getReference('part_requirement', function(value) {
			partFetched = true;
			partRequirement = value;
			updateRecord();
		});
	}
}
