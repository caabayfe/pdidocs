function transform(input) {
    var allowedFontExtensions = ['ttf', 'otf', 'woff', 'woff2'];
    var output = {
        result: false,
        error: ''
    };
    var sysId = input.sysId;
    var gr = new GlideRecord('sys_attachment');
    gr.addQuery('table_sys_id', sysId);
    gr.query();
	
	// Multiple attachments not allowed
	if (gr.getRowCount() > 1) {
		output.error = gs.getMessage('Multiple attachments found. Please upload a single font file.');
		return output;
	}
	
    if (gr.next()) {
        var fileName = gr.getValue('file_name');
        var fileExtension = fileName.split('.').pop();
        if (allowedFontExtensions.indexOf(fileExtension) > -1) {
            output.result = true;
        } else {
            output.error = gs.getMessage('Invalid file extension.');
        }
    } else {
        output.error = gs.getMessage('File attachment not found.');
    }
    return output;
}
