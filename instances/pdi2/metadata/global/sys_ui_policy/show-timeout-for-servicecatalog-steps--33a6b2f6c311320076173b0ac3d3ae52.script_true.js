function onCondition() {
	var stepConfig = g_form.getValue('step_config');
	// For portal cat item/order guide/RP views default timeout to 30s
	if (stepConfig == 'e81f02dc73e703008e6b0d573cf6a76f' ||
		stepConfig == 'aced8452731b13008e6b0d573cf6a783' ||
		stepConfig == '775638f29f3203002899d4b4232e70e5')
		g_form.setValue("timeout", "0 00:00:30");

}
