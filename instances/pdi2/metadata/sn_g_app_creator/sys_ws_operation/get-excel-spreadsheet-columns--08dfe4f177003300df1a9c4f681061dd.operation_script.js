(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var MIN_COLUMN_LENGTH = 40;
	
	function isAttachmentAccessible(sysId) {
		var gr = new GlideRecordSecure("sys_attachment");
		gr.addQuery("sys_id", sysId);
		gr.query();
		return gr.hasNext();
	}

	function getAttachmentSysId(sysId) {
		if (!sysId) {
			throw "Attachment SysID is required ";
		}

		if (!isAttachmentAccessible(sysId)) {
			throw "Attachment " + sysId + " was not found";
		}

		return sysId;
	}

	function getHeaderRow(headerRowParam) {
		// Note: GlideExcelParser expects a zero-based header row number.
		var row = headerRowParam ? (+headerRowParam[0] - 1) : 0;
		if (isNaN(row) || typeof row !== "number") {
			throw "Header row invalid " + headerRowParam;
		}

		return row;
	}

	var headerRow = getHeaderRow(request.queryParams.headerRow);
	var attachmentSysId = getAttachmentSysId(request.queryParams.attachmentSysId);
	var attachmentStream = new GlideSysAttachment().getContentStream(attachmentSysId);

	var parser = new sn_impex.GlideExcelParser();
	parser.setHeaderRowNumber(headerRow);
	if (!parser.parse(attachmentStream)) {
		throw "Attachment could not be parsed as an Excel Spreadsheet " + attachmentSysId;
	}

	var columns = {};
	var tableInfo = parser.getTableInfo();
	for (var name in tableInfo) {
		columns[name] = {
			label: name,
			internal_type: tableInfo[name].getType(),
			max_length: Math.max(tableInfo[name].getLength(), MIN_COLUMN_LENGTH)
		};
	}

	return { columns: columns };
})(request, response);
