if (current != null) {
  var thisTask = current.sys_id;
  var noNotify = new Object();
  var logMessage = gs.getProperty("glide.affected_notifications.log.enable", "false");

  var affectedItem = new GlideRecord('task_location');
  affectedItem.addQuery('task', thisTask);
  affectedItem.query();
  while (affectedItem.next()) {
    var itemSysID = affectedItem.location;
    var itemName = affectedItem.location.getDisplayValue();
    if (!noNotify[itemSysID]) {
      noNotify[itemSysID] = true;
      if (logMessage == "true") {
        gs.log('### Notifying subscribers of ' + itemName, 'Business Rule: Affected location notifications');
      }
      gs.eventQueue('location.affected', current, itemSysID, itemName);
      notifyParents('cmn_location', itemSysID, logMessage);
    }
  }
}

function notifyParents(table, itemSysID, logMessage) {
   var item = new GlideRecord(table);
   item.addQuery('sys_id', itemSysID);
   item.query();
   if (item.next()) {
      if (item.parent) {
         var parentSysID = item.parent;
         var parentName = item.parent.getDisplayValue();
         if (!noNotify[parentSysID]) {
            if (logMessage == "true") {
              gs.log('### Notifying subscribers of ' + parentName, 'Business Rule: Affected location notifications');
            }
            noNotify[parentSysID] = true;
            gs.eventQueue('location.affected', current, parentSysID, parentName);
            notifyParents(table, parentSysID, logMessage);
         }
      }
   }
}
