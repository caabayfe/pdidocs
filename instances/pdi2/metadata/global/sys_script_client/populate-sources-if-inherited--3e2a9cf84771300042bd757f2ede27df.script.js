function onLoad() {
	if(!g_form.isNewRecord())
		return;

  if(g_form.getValue('parent') != '')
      g_form.setValue('inherited', true, true);
  else
    return;

	var parent = g_form.getReference('parent', setValues);

}

function setValues(parent) {
	g_form.setValue('contract', parent.contract, parent.contract.number);
	g_form.setValue('asset', parent.asset, parent.asset.number);
	g_form.setValue('task', parent.task, parent.task.number);
	g_form.setValue('user', parent.user);
	g_form.setValue('cost_center', parent.cost_center);
	g_form.setValue('source_table', parent.source_table);
	g_form.setValue('source_id', parent.source_id, '(empty)');
}
 
