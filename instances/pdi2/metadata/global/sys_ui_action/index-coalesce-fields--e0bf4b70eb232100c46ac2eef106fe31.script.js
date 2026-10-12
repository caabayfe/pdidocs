function showIndexCreator(){
	var ga = new GlideAjax("CoalesceIndexValidatorAjax");
	ga.addParam("sysparm_name", "getIndexData");
	ga.addParam("sysparm_map_id", g_scratchpad.mapId);
	ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	// get result element and attributes 
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var indexNeeded = result[0].getAttribute("indexNeeded");
	var coalesceFieds = result[0].getAttribute("coalesceFieds");
	//var indexName = result[0].getAttribute("indexName");
	var targetTable = result[0].getAttribute("targetTable");
	if(indexNeeded == "true"){
		var gDialog = new GlideDialogWindow("dialog_index_create");
    	gDialog.setSize(400, 250);
    	gDialog.setPreference('index_table', targetTable);
    	gDialog.setPreference('index_fields', coalesceFieds);
    	gDialog.setPreference('table', 'dialog_index_create');
    	gDialog.setTitle('Create a New Index');
    	gDialog.render();
    } 
	else{
    	var dialog = new GlideDialogWindow("glide_alert_standard");
		dialog.setSize(400, 250);
		if(coalesceFieds.length == ''){
			dialog.setPreference('title', getMessage("No coalesce field selected."));
			dialog.setTitle(getMessage(''));
		}else{
			 dialog.setTitle(getMessage("Index already exists"));
			dialog.setPreference('title', new GwtMessage().getMessage("Index already exists for at least one coalesce field on table: {0}.",targetTable));
		}
		dialog.setPreference('warning', true);
 	   dialog.render();
	 }
}
