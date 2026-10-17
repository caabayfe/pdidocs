/**
 * Disable if element is not filterable
 */
setTaskable();

/**
 * Prevent nested board creation
 */
disableInVtbListView();


function setTaskable() {

   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;
	
   if (hdrCell.getAttribute('glide_type') === 'related_tags')
      g_menu.setDisabled(g_item);
   else
	  g_menu.setEnabled(g_item);
}

function disableInVtbListView() {
	var containerFrame = g_list.getContainerFrame();
	if (containerFrame && containerFrame.getAttribute('id') === 'vtb_list_view')
		g_menu.setDisabled(g_item);
}
