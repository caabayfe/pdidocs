function onCondition() {
	var isRecordProducer = g_scratchpad.is_record_producer;
	var isCompositeRecordProducer = g_scratchpad.is_composite_record_producer;
	if (isRecordProducer || isCompositeRecordProducer)
		g_form.setDisplay('map_to_field', true);
}
