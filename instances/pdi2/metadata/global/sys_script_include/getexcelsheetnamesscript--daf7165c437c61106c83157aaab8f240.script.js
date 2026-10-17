var GetExcelSheetNamesScript = Class.create();
GetExcelSheetNamesScript.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'GetExcelSheetNamesScript',
	getSheetNames: function() {
		var sheetNameList = [];
		var sheetNumber = 0;
		var source_sys_id = this.getParameter('sysparm_source_sys_id');
		if (!gs.nil(source_sys_id)) {
			var dataSourceGr = new GlideRecord("sys_data_source");
			if(dataSourceGr.canRead() && dataSourceGr.get(source_sys_id)) {
				sheetNumber = dataSourceGr.getValue("sheet_number");
				var attachment = new GlideSysAttachment();
				var agr = attachment.getAttachments('sys_data_source', source_sys_id);
				while(agr.next()) {
					gs.debug("The name of the file is: " + agr.getValue('file_name'));	

					var attachmentSysId = agr.getValue('sys_id');
					var parser = new sn_impex.GlideExcelParser();
					var attachmentStream = attachment.getContentStream(attachmentSysId);
					parser.setSource(attachmentStream);
					sheetNameList = parser.getSheetNames();

					// make each sheet name translatable - since dynamic value, need to use gs.getMessage()
					sheetNameList = sheetNameList.map(function(name) {
						return gs.getMessage("{0}", name);
					});
				}
			} else {
				gs.error("Unable to fetch the data source record.");
			}
		}
		return JSON.stringify({ "sheetNumber": sheetNumber,"sheetNameList" : sheetNameList});
	}
});
