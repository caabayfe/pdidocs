function onClick() {
    function queryDelete() {
        var s = new GlideAjax('DeleteRecordAjax');
        s.addParam('sysparm_name', 'getCascadeDeleteTables');
        s.addParam('sysparm_obj_id', g_form.getUniqueValue());
        s.addParam('sysparm_table_name', g_form.getTableName());
        s.getXMLAnswer(callback);
    }

    function doDelete() {
        g_form.submit('sysverb_ws_delete');
    }

    function callback(answer) {
        var parts = answer.split(';');
        if (parts.length > 2) {
            var cascadeTableData = parts[2].split(',');
            var richTextContent = generateCascadeDeleteHTML(cascadeTableData);
            var title = getMessage('Delete these records?');
            var style = {
                size: 'lg',
                confirmTitle: getMessage('Delete'),
                confirmType: 'destructive',
                cancelTitle: getMessage('Cancel')
            };
            g_modal.richText(
                title,
                richTextContent,
                function(ret) {
                    if (ret) doDelete();
                },
                style
            );
        } else {
            var msg = getMessage('Delete this record?');
            g_modal.confirmDestroy(getMessage('Confirmation'), msg, function(ret) {
                if (ret) doDelete();
            });
        }
    }

	function generateListHTML(cascadeTableData) {
		if (!cascadeTableData) return '';
		var generatedHTML = '<ul id="cascade-delete-list">';
		cascadeTableData.forEach(function(currTableData) {
			if (!currTableData) return;
			var splitTableData = currTableData.split(':');
			if (!splitTableData || splitTableData.length < 2) return;
			var numberOfRecords = splitTableData[0];
			var tableName = splitTableData[1];
			generatedHTML +=
				'<li>' +
				'<span class="cascade-delete-table-name">' +
				tableName +
				'</span>' +
				'<now-badge variant="secondary" size="sm" status="gray" value="' +
				numberOfRecords +
				'"/>' +
				'</li>';
		});
		generatedHTML += '</ul>';
		return generatedHTML;
	}

	function generateCascadeDeleteHTML(cascadeTableData) {
		var richText =
			'<style>' +
			'#cascade-delete-warning-highlight { padding-bottom:16px }' +
			'#cascade-delete-list { list-style-position:inside;padding-inline-start:4px }' +
			"#cascade-delete-list li::marker { content:'•' }" +
			'#cascade-delete-list li .cascade-delete-table-name { padding-inline-start:4px }' +
			'#cascade-delete-list li now-badge { padding-inline-start:8px }' +
			'</style>' +
			'<div>' +
			'<now-highlighted-value id="cascade-delete-warning-highlight" label="' +
			getMessage('Warning!') +
			'" variant="primary" icon="triangle-exclamation-outline" color="critical"></now-highlighted-value>' +
			'<div>' +
			getMessage(
				'Deleting this record will result in the automatic deletion of these related records, which may also cause a cascade of additional records to be deleted.'
			) +
			'</div>' +
			'<div>' +
			generateListHTML(cascadeTableData) +
			'<p>' +
			getMessage('Do you want to proceed?') +
			'</p>' +
			'</div>' +
			'</div>';
		return richText;
	}

    queryDelete();
}
