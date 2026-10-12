/**
 * Disable if element is not filterable
 */
setFilterable();

function setFilterable() {
	
   var hdrCell = g_list.getHeaderCell(g_fieldName);
	
   if (!hdrCell)
      return;

   var filterable = (getAttributeValue(hdrCell, 'filterable') == "true") && !(hdrCell.getAttribute('glide_type') == 'related_tags');
	   
   if (filterable)
      g_menu.setEnabled(g_item);
   else
      g_menu.setDisabled(g_item);
}
