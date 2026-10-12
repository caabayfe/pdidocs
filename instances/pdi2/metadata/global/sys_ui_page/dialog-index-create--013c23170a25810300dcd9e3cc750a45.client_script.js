function validateAndSubmit() {
    var msg = new GwtMessage();
    var values = ['Index creation successfully scheduled. If it completes successfully, the index will be added to your current update set "{0}".','Please specify an email address','An email will be sent to {0} upon completion.'];
    var answer = msg.getMessages(values);
    if (!isValid(answer['Please specify an email address']))
      return false;

    scheduleCreation(answer['Index creation successfully scheduled. If it completes successfully, the index will be added to your current update set "{0}".'], answer['An email will be sent to {0} upon completion.']);
    GlideDialogWindow.get().destroy();
    return false;
}

function scheduleCreation(success, emailSuccess) {
    var table = gel('table').value;
    var fields = gel('fields').value;
	var access_method = gel('access_method').value;
    var unique = gel('unique').value;
    var email = gel ('email').value;
    var name = gel('index_name').value;
    if (unique)
       unique = "true";
    else
       unique = "false";
    var ga = new GlideAjax('ScheduleCreator');
    ga.addParam('sysparm_name','createSchedule');
    ga.addParam('sysparm_table',table);
    ga.addParam('sysparm_fields', fields);
    ga.addParam('sysparm_access_method', access_method);
    ga.addParam('sysparm_unique', unique);
    ga.addParam('sysparm_email', email);
    ga.addParam('sysparm_schedule_name',name);
    ga.getXML();
    var script = "gs.include('IndexCreator');";
    success = formatMessage(success, gel('currUpdateSetName').value);
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
