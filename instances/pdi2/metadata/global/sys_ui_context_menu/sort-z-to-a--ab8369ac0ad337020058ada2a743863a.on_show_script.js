/**
 * Disable sorting if element is not sortable
 */
setSortable();

function setSortable() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;

   var sortable = (getAttributeValue(hdrCell, 'sortable') == "true" && getAttributeValue(hdrCell, 'sort_dir') != "DESC");
   if (sortable)
      g_menu.setEnabled(g_item);
   else
      g_menu.setDisabled(g_item);
}
