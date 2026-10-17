function onLoad() {
   
   g_form.showFieldMsg('input_format_description', new GwtMessage().getMessage('Description of expected format and structure for spoken responses (e.g., 6-character alphanumeric code beginning with a letter)'), 'info');
   g_form.showFieldMsg('input_format_example', new GwtMessage().getMessage('Comma-separated examples of valid spoken responses to guide voice interpretation (e.g., K1A1B1, M5W1E6)'), 'info');
   g_form.showFieldMsg('input_validation_pattern', new GwtMessage().getMessage('Regular expression pattern to validate the interpreted response against expected format (e.g., ^[A-Z]\d[A-Z]\d[A-Z]\d$ for Canadian postal codes)'), 'info');
}
