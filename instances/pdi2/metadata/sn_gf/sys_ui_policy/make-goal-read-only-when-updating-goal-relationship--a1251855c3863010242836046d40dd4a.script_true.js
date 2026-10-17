function onCondition() {
	if(g_form.getValue('table_name')!='invst_investment'){
		g_form.setReadOnly('goal', true);
	}

}
