// whenever we change a module
// we need to flush the realform cache
system.cacheFlush("sys_ui_realform");


var op = gs.getMessage("inserted");
if (current.operation() == "update")
  op = gs.getMessage("updated");

if (current.operation() == "delete")
  op = gs.getMessage("deleted");

// tell the UI to refresh the navigator
var notification = new UINotification('system_event');
notification.setAttribute('event', 'refresh_nav');
notification.send();
    
