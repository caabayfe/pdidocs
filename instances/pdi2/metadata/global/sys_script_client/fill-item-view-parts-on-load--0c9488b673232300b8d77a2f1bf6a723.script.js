function onLoad() {
	// Type appropriate comment here, and begin script below
	var itemViewId = g_form.getValue('item_vew');
	if (!itemViewId)
		return;

	var itemViewElementsProvider = new GlideAjax('ItemViewElementsProvider');
	itemViewElementsProvider.addParam('sysparm_name', 'getElementsIds');
	itemViewElementsProvider.addParam('sysparam_item_view_id', itemViewId);
	itemViewElementsProvider.getXML(addItemViewIds);

	function addItemViewIds(response) {
		var idListJSON = response.responseXML.documentElement.getAttribute('answer');
		if (idListJSON == null)
			return;

		var idList = JSON.parse(idListJSON);
		var currentElementId = g_form.getValue('item_view_element');
		g_form.clearOptions('item_view_element');
		for (var index = 0; index < idList.length; index++) {
			var label = idList[index].name + ' - [' + idList[index].id + ']';
			if(idList[index].cellId)
				label = idList[index].cellId + " - " + idList[index].name +  ' - [' + idList[index].id + ']';
				
			g_form.addOption('item_view_element', idList[index].id, label);				
		}

		g_form.setValue('item_view_element', currentElementId, '');
	}
}
