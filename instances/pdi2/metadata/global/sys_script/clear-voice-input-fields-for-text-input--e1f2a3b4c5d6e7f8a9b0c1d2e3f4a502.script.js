(function executeRule(current, previous /*null when async*/) {

	// Clear voice-specific fields when the record transitions to (or is saved as)
	// input_type=text. This keeps the Voice-defaults BR's gs.nil guards correct on
	// a later text->voice flip so canonical fixed defaults repopulate instead of
	// stale values leaking through. Explicit script used instead of the field
	// template because ServiceNow's encoded-query template parser applied only
	// the first field=empty entry reliably.
	current.input_format_description = '';
	current.input_format_example = '';
	current.input_validation_pattern = '';

})(current, previous);
