function onRefresh() {
   var discID = $F('sys_uniqueValue');
   var action = 'discovery_status.do?sys_id=';
   window.location = action + discID;
}
