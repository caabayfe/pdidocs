function goToDependencyView() {
	var sys_id = g_form.getUniqueValue();
	var url = '/nav_to.do';
	url += '?uri=/$ngbsm.do?id=' + sys_id;
	g_navigation.openPopup(url);
}
