/**
 * This server-side script is used to dynamically create actions for the context menu, such as the list of available templates
 *
 * The following variables are available to the script:
 *    'g_tableName' the name of the current table
 *    'g_listId' the id of the list we are building the context menu for
 *
 * Add items to the context menu by calling:
 *    g_contextMenu.addAction(item_id, label, script_string, order);
 */
