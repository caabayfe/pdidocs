// Show Group by 'field' and enable if not already grouped by that field
setGroupLabel();
setGroupState();

// get the translated value for 'Group by' - save it for later use
function setGroupLabel() {
   var msg = getAttributeValue(g_item, 'message');
   if (!msg) {
      msg = g_item.innerHTML;
      setAttributeValue(g_item, 'message', msg);
   }
   
   if ('innerText' in g_item) {
      g_item.innerText = msg + " " + g_fieldLabel;
   } else {
      g_item.textContent = msg + " " + g_fieldLabel;
   }
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
