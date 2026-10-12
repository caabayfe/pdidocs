function onCondition() {
	$$(".form_action_button").each(function (item) { if (item.id == "sc_ic_publish") item.show()});
	$$(".form_action_button").each(function (item) { if (item.id == "sc_ic_unpublish") item.hide()});
}
