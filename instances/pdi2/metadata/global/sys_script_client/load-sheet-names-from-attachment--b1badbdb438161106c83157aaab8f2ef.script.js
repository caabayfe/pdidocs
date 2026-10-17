function onLoad() {
	var ga = new GlideAjax('GetExcelSheetNamesScript');
	ga.addParam('sysparm_name', 'getSheetNames');
	ga.addParam('sysparm_source_sys_id',g_form.getUniqueValue());
	ga.getXML(SheetNamesParse);

	function SheetNamesParse(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");		
		var result = JSON.parse(answer);
		
		var sheetNumber = result.sheetNumber;
		var sheetNamesList = result.sheetNameList;
		
		g_form.clearOptions('sheet_name');
		for (var i = 0; i < sheetNamesList.length; i++) {
			g_form.addOption('sheet_name',i+1,sheetNamesList[i]);
		}

		if(sheetNamesList.length > 0 ){
			// If sheet number is 0, we want to set it to 1 because sheet name options set have values starting from 1 
			// It is possible that an Excel sheet number is updated in data source directly and if it is > the sheetNamesList length then we want to reset it to 1
			sheetNumber = sheetNumber == 0 || sheetNumber > sheetNamesList.length ? 1 : sheetNumber;
			g_form.setValue('sheet_name',sheetNumber);
		} else {
			g_form.addOption('sheet_name',1,"-- None --");
			g_form.setValue('sheet_name',1);
		}
	}
}
