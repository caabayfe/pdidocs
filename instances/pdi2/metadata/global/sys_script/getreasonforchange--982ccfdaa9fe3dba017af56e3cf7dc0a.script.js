// Get the reason for a change
//
function GetReasonForChange(table, id, display) {
   return gs.getMessage("Changed by") + " " + '<a href="' + table + '.do?sys_id=' + id + '">' + display + '</a>';
}
