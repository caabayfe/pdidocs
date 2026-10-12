function onClick(g_form) {
	var stock = g_form.getDisplayValue('stockroom');
	var assetName = g_form.getValue('display_name');
	var assetSysId = g_form.getUniqueValue();
	g_modal.showFrame({title: assetName, url: '/consume_a_consumable.do?sysparm_sys_id='+assetSysId+'&sysparm_stockroom='+stock+'&from_workspace=true', size:'lg'});

}
