function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	var itemViewElementsProvider = new GlideAjax('ItemViewElementsProvider');
	itemViewElementsProvider.addParam('sysparm_name', 'getElementsIds');
	itemViewElementsProvider.addParam('sysparam_item_view_id', newValue);
	itemViewElementsProvider.getXML(addItemViewIds);

	function addItemViewIds(response) {
		var idListJSON = response.responseXML.documentElement.getAttribute('answer');
		if (idListJSON == null)
			return;

		var idList = JSON.parse(idListJSON);
		g_form.clearOptions('item_view_element');
		for (var index = 0; index < idList.length; index++) {
			var label = idList[index].name + ' - [' + idList[index].id + ']';
			if(idList[index].cellId)
				label = idList[index].cellId + " - " + idList[index].name +  ' - [' + idList[index].id + ']';
				
			g_form.addOption('item_view_element', idList[index].id, label);	
		}
	}
}
