var TBWSheetAPI = Class.create();

TBWSheetAPI.prototype = {
    initialize: function(attachmentId) {
        this.sysId = attachmentId;
    },

    build: function() {
        var result = this._validate();

        if (!result.isValid)
            return TBWUtil.error(result);

        return this._getSheetsInfo();
    },

    _getSheetsInfo: function _getSheetsInfo() {
        var gParser = new sn_impex.GlideExcelParser();
        var gAttachment = new GlideSysAttachment();
        var stream = gAttachment.getContentStream(this.sysId);

        if (!gParser.parse(stream)) {
            throw gs.getMessage('Attachment could not be parsed as an Excel Spreadsheet ${0}', this.sysId);
        }

        return gParser.getSheetNames()
            .map(function(sheetName, index) {
                return {
                    sheetName: sheetName,
                    sheetNumber: index + 1
                };
            });

    },

    _validate: function _validate() {
        var res = Validators.isValidAttachment(this.sysId);
		
        if (!res.isValid)
            return res;

        return {
            isValid: true
        };
    },

    type: 'TBWSheetAPI'
};
