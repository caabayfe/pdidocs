function openOpsView() {
		var locals = JSON.parse(g_form.getValue("locals"));

        g_navigation.open('/$flow-designer.do#/operations/context/'+locals.fdContext, '_blank');
	
}
