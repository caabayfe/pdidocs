function sortAgenda() {
	var dialog = new GlideModal('sn_change_cab_reorder_agenda_items');
	dialog.setTitle(new GwtMessage().getMessage('Reorder agenda items'));
	dialog.setPreference('orderAgendaItems',  orderAgendaItems.bind(this, dialog));
	dialog.setPreference('sysparm_orderFields', g_list.orderBy.join("^"));
	dialog.render();
}

function orderAgendaItems(dialog) {
	dialog.destroy();
	
	var ga = new GlideAjax("CABMeetingAjax");
	ga.addParam("sysparm_name", "orderAgenda");
	ga.addParam("sysparm_meeting", g_form.getUniqueValue());
	ga.addParam("sysparm_orderby", g_list.orderBy.join("^"));
	ga.getXMLAnswer(function (){
		g_list.refreshWithOrderBy();
		g_form.addInfoMessage(getMessage("The agenda items have been reordered"));
	});
}
