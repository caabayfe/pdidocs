/**
 * Disable sorting if element is not sortable
 */
setSortable();
setGroupState();

function setSortable() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;

   var sortable = (getAttributeValue(hdrCell, 'sortable') == "true");
   if (sortable)
      g_menu.setEnabled(g_item);
   else
      g_menu.setDisabled(g_item);
}

// disable is this field is not groupable
function setGroupState() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;
   
   var groupable = (getAttributeValue(hdrCell, "groupable") == "true");
   if ((!groupable) || (g_list.getGroupBy() == ("GROUPBY" + g_fieldName)))
      g_menu.setDisabled(g_item);
   else
      g_menu.setEnabled(g_item);
}
