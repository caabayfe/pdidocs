function onLoad() {
	// State values: 1 - Requested, 2 - Order Confirmed, 3 - Shipped, 4 - Delivered, 5 - Cancelled
	var state = g_form.getValue('state');
	if (state === '4' || state === '5') {
		g_form.setReadOnly('state', true);
		return;
	}
	var removeOptions = {
		1: [3, 4, 5],
		2: [1, 4, 5],
		3: [1, 2, 5],
		4: [1, 2, 3, 5],
	};
	for (var i = 0; i < removeOptions[state].length; i++) {
		g_form.removeOption('state', removeOptions[state][i]);
	}
}
