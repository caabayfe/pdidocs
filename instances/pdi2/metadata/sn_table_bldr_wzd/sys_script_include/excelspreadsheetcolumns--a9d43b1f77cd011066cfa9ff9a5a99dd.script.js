var ExcelSpreadsheetColumns = Class.create();
ExcelSpreadsheetColumns.prototype = {
    initialize: function(queryParams) {
        this.headerRow = this._getHeaderRow(queryParams.headerRow);
        this.attachmentSysId = this._getAttachmentSysId(queryParams.attachmentSysId);
        this.sheetNumber = this._getSheetNumber(queryParams.sheetNumber);
    },

    build: function() {
        var attachmentStream = new GlideSysAttachment().getContentStream(this.attachmentSysId);

        var parser = new sn_impex.GlideExcelParser();
        parser.setHeaderRowNumber(this.headerRow);
        parser.setSheetNumber(this.sheetNumber);
        if (!parser.parse(attachmentStream)) {
            throw gs.getMessage("Attachment could not be parsed as an Excel Spreadsheet '{0}'", this.attachmentSysId);
        }

        var columns = {};
        var tableInfo = parser.getTableInfo();
        for (var name in tableInfo) {
            columns[name] = {
                label: name,
                internal_type: tableInfo[name].getType(),
                max_length: Math.max(tableInfo[name].getLength(), TBWConstants.MIN_COLUMN_LENGTH)
            };
        }

        return {
            columns: columns
        };
    },

    _getAttachmentSysId: function(sysId) {
        if (!sysId) {
            throw gs.getMessage("Attachment SysID is required ");
        }

        var res = Validators.isValidAttachment(sysId);
        if (!res.isValid) {
			throw TBWUtil.error(res);
        }

        return sysId;
    },

    _getHeaderRow: function(headerRowParam) {
        // Note: GlideExcelParser expects a zero-based header row number.
        var row = headerRowParam ? (+headerRowParam[0] - 1) : 0;
        if (isNaN(row) || typeof row !== "number") {
            throw gs.getMessage("Header row invalid '{0}'", headerRowParam);
        }

        return row;
    },

    _getSheetNumber: function(sheetNumberParam) {
        // Note: GlideExcelParser expects a zero-based sheetNumber
        var sheetNumber = sheetNumberParam ? (+sheetNumberParam[0] - 1) : 0;
        if (isNaN(sheetNumber) || typeof sheetNumber !== "number") {
            throw gs.getMessage("Sheet Number invalid '{0}'", sheetNumberParam);
        }

        return sheetNumber;
    },

    type: 'ExcelSpreadsheetColumns'
};
