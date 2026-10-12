function onCondition() {
	if (!g_form.isNewRecord()) {
			g_form.setReadOnly('name', true);	
			var superClass = gel('sys_db_object.super_class');
			var emptySuperClass = superClass != null && (superClass.value == null || superClass.value.length == 0);
			if (emptySuperClass)
				g_form.setVisible('super_class', false);
			else
				g_form.setReadOnly('super_class', true);

	}
}
