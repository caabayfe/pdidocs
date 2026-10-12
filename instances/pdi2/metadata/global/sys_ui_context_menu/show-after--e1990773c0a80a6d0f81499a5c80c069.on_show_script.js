/**
 * Disable if element is not filterable
 */
setDateColumn();

function setDateColumn() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;

   var type = getAttributeValue(hdrCell, 'glide_type');
   var sortable = (getAttributeValue(hdrCell, 'sortable') == "true");
   var isDateTime = (type == "glide_date_time" || type == "glide_date");
   if (isDateTime) {
	   if(sortable)
		  g_menu.setVisible(g_item);
	   else
		  g_menu.setDisabled(g_item);
   } else
	   g_menu.setHidden(g_item);
}
