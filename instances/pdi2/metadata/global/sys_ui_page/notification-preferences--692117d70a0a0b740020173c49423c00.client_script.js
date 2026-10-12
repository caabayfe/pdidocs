var checkboxes = document.getElementsByTagName('input');
for (var i=0; i < checkboxes.length; i++)  {
  if (checkboxes[i].type == 'checkbox' && checkboxes[i].getAttribute('checked') != "checked")   {
    checkboxes[i].checked = false;
  }
}

function lockRow(messageSysID) {
   var button = document.getElementsByName('message.' + messageSysID);
   var row = gel(messageSysID);

   for(i = 0; i < button.length; i++) {
      button[i].setAttribute('disabled', 'true');
   }
   row.setAttribute('style', 'color: #CCCCCC');
}

function openDevice(deviceSysID, deviceName) {
   var uName = gel('hidden_user_name').value + "'s ";
   deviceName = new String(deviceName).escapeHTML();
   var gp = new GlideModalForm(uName + deviceName, "cmn_notif_device", refreshNotifPage);
   gp.addParm('sys_id', deviceSysID);
   gp.render();
}

function openNotif(notifSysID, notifName, deviceName) {
   var uName = gel('hidden_user_name').value + "'s ";
   var gp = new GlideModalForm(notifName + ' on ' + uName + deviceName, "cmn_notif_message", refreshNotifPage);
   gp.addParm('sys_id', notifSysID);
   gp.render();
}

function refreshNotifPage() {
   window.location.reload(false);
}

function newDevice() {
   var uName = gel('hidden_user_name').value;
   var userID = gel('hidden_user_id').value;
   var gp = new GlideModalForm("New Device for " + uName, "cmn_notif_device", refreshNotifPage);
   gp.addParm('sys_id', '-1');
   gp.addParm('sysparm_query', 'user=' + userID);
   gp.render();
}

function newNotif(deviceSysID, deviceName) {
   var uName = gel('hidden_user_name').value + "'s ";
   var userID = gel('hidden_user_id').value;
   var gp = new GlideModalForm("New Notification for " + uName + deviceName.escapeHTML(), "cmn_notif_message", refreshNotifPage);
   gp.addParm('sys_id', '-1');
   gp.addParm('sysparm_query', 'user=' + userID + "^device=" + deviceSysID);
   gp.render();
}

function removeMessage(sysID) {
   var message = new GlideRecord('cmn_notif_message');
   message.get(sysID);
   message.deleteRecord(function(){reloadWindow(window);});
}
