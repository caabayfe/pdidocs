setWorkflowExpandable();

function setWorkflowExpandable() {
   var hdrCell = g_list.getHeaderCell(g_fieldName);
   if (!hdrCell)
      return;

   var workflow = (getAttributeValue(hdrCell, 'glide_type') == "workflow");
   if (workflow)
      g_menu.setVisible(g_item);
   else
      g_menu.setHidden(g_item);
}
