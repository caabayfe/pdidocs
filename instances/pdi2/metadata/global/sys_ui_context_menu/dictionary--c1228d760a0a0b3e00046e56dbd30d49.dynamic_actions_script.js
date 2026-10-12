/**
  * This server-side script is used to dynamically create actions for the context menu, such as the list of available templates
  * Add items to the context menu by calling:
  *    g_contextMenu.addAction(item_id, label, script_string, order);
  */
buildContextActions();

function buildContextActions() {
   var queryGen = new GlideCollectionQueryCalculator();  
   var query = queryGen.buildDictionaryQueryClause(g_tableName);

   g_contextMenu.addAction('dictionary', g_itemName, "showDictionary('" + query + "');", g_itemOrder); 
}
