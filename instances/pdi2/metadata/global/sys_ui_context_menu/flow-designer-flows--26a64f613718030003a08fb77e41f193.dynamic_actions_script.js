buildContextActions();

function buildContextActions() {	
	g_contextMenu.addAction('flow_designer_flows', g_itemName, "showFlows('" + g_tableName + "');", g_itemOrder);
}
