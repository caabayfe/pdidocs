function validateAndSubmit(table, hasIndex, isMigratedTable) {
    var msg = new GwtMessage();
    var answer = msg.getMessages(['Text index generation successfully scheduled.','Please specify an email address','An email will be sent to {0} upon completion.']);
    if (!isValid(answer['Please specify an email address']))
      return false;

    scheduleRegen(answer['Text index generation successfully scheduled.'], answer['An email will be sent to {0} upon completion.'], table, hasIndex, isMigratedTable);
    GlideDialogWindow.get().destroy();
    return false;
}

function scheduleRegen(success, emailSuccess, table, hasIndex, isMigratedTable) {
    var textIndexAll = "indexAll";
    var textIndexCreate = "createIndex";
	var migrateTable = 'migrate_table';
    var eventName;
    
	if (isMigratedTable == 'true') {
      eventName = migrateTable;
	} else if (hasIndex == 'true') {
      eventName = textIndexAll;
    } else {
      eventName = textIndexCreate;
    }
    var ga = new GlideAjax('ScheduleEvent');
    ga.addParam('sysparm_name','scheduleIR');
    ga.addParam('sysparm_table',table);
    ga.addParam('sysparm_event',eventName);
    ga.addParam('sysparm_value',gel("email").value);
    ga.getXML(); 

    if (getNotification() == 'email')
       success += " " + formatMessage(emailSuccess, gel('email').value);
    alert(success);
}

function isValid(msg) {
    var n = getNotification(); 
    if (n == 'email') {
      var e = gel('email').value; 
      if (!e) {
        alert(msg);
        return false;
      }
    } else
       gel('email').value = '';
    return true;
}

function getNotification() {
   var a = document.getElementsByName('notify');
   for (var i=0; i < a.length; i++) 
     if (a[i].checked)
        return a[i].value;
}
