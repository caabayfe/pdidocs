/**
 * Disable if element is not matchable
 */
setMatchable();

function setMatchable() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;

   var filterable = (getAttributeValue(hdrCell, 'filterable') == "true");
   var columnOK = (hdrCell.getAttribute('glide_type') != 'related_tags' && hdrCell.getAttribute('glide_type') != 'password');

   if (filterable && columnOK)
      g_menu.setEnabled(g_item);
   else
      g_menu.setDisabled(g_item);
}
