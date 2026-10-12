function onLoad() {
	g_form.addDecoration(
		'script_query_result',
		'icon-info',
		getMessage('The key \'active\' is mandatory to be returned in Query result script response'),
		'color-accent'
	);

	g_form.addDecoration(
		'script_card_metadata',
		'icon-info',
		getMessage('Refer to the \'Card metadata\' field in Action card for the required JSON format'),
		'color-accent'
	);
}
