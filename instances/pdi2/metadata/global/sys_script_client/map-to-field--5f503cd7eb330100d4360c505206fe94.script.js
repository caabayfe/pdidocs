function onLoad() {
	var isProducer = g_scratchpad.is_record_producer;
	var isCompositeProducer = g_scratchpad.is_composite_record_producer;
	// if item is record producer or composite producer, show map_to_field.
	if (isProducer || isCompositeProducer) {
		g_form.setDisplay('map_to_field', true);
	}
	else {
		g_form.setDisplay('map_to_field', false);
	}
}
