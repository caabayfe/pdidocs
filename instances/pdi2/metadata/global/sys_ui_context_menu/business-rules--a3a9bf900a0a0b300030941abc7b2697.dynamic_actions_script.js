/**
  * This server-side script is used to dynamically create actions for the context menu, such as the list of available templates
  * Add items to the context menu by calling:
  *    g_contextMenu.addAction(item_id, label, script_string, order);
  */
buildContextActions();

function buildContextActions() {
   var queryGen = new GlideCollectionQueryCalculator();  
   var collectionQuery = queryGen.buildQueryClause(g_tableName, 'collection');     

   g_contextMenu.addAction('business_rules', g_itemName, "showBusinessRules('" + collectionQuery + "');", g_itemOrder); 
}
