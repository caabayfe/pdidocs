/**
 * This server-side script is used to dynamically create actions for the context menu, such as the list of available templates
 * Add items to the context menu by calling:
 *    g_contextMenu.addAction(item_id, label, script_string, order);
 */
buildContextActions();


function buildContextActions() {
   var queryGen = new GlideCollectionQueryCalculator();
   var query = queryGen.buildQueryClause(g_tableName, 'table');

   g_contextMenu.addAction('client_scripts', g_itemName, "showClientScripts('" + query + "');", g_itemOrder);
}
