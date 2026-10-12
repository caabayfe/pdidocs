var PDFtoTableOperations = Class.create();


PDFtoTableOperations.prototype = {
    initialize: function() {},

    isTableCreatedFromPDF: function(table_name) {
     var pdfToTableOperationHelper = new PDFtoTableOperationHelper();
        var isPDI = pdfToTableOperationHelper.isPDI();

        if (isPDI) {
            return {
                status: 'error',
                isTableCreatedFromPDF: false,
                message: 'PDI does not support this feature'
            };
        }

        var grInput = new GlideRecord(PDFtoTableConstants.PDF_INPUT_TABLE);
		grInput.addQuery('state', 'complete');
		grInput.addQuery('chunk_number', 0);
		var table_obj = {};
        var return_obj = {
            status: 'error',
            isTableCreatedFromPDF: false,
            message: 'The given table name and sys_id is not valid'
        };

        if (!grInput.isValid()) {
            return_obj['message'] = "The PDF input table is not exist in instance";
            return return_obj;
        }

        if (!table_name) {
            return {
                status: 'error',
                message: 'The Given table name is not valid'
            };
        }

        if (table_name) {
			table_obj= pdfToTableOperationHelper.getTableSysId(table_name);
			var sysId = table_obj['sysId'];
			return_obj['label']= table_obj['label'];
            sysId && grInput.addEncodedQuery("tables_createdLIKE" + sysId);
        } else {
            return return_obj;
        }

        grInput.query();

        if (grInput.next()) {
            return_obj['status'] = 'success';
            return_obj['isTableCreatedFromPDF'] = true;
            return_obj['pdfAttachmentSysId'] = grInput.getValue('pdf');
            return_obj['message'] = 'This given table created from PDF extractor';
        } else {
            return_obj['status'] = 'success';
            return_obj['isTableCreatedFromPDF'] = false;
            return_obj['message'] = 'This given table is not created from PDF extractor';
        }

        return return_obj;
    },

    type: 'PDFtoTableOperations'
};
