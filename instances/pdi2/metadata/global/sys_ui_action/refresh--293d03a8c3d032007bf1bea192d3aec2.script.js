function onRefresh() {
   var discID = $F('sys_uniqueValue');
   var action = 'automation_status_set.do?sys_id=';
   window.location = action + discID;
}
