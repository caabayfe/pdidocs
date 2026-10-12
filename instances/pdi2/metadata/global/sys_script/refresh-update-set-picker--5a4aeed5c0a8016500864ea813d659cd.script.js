refreshUpdateSetPicker();

function refreshUpdateSetPicker() {
   var n = new UINotification('update_set_change');
   n.setAttribute('update_only', 'true');
   n.send();
}
