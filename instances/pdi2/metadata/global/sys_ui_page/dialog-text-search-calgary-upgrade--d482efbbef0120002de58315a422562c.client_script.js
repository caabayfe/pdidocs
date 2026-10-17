function validateAndSubmit() {
    var msg = new GwtMessage();
    var values = ['Text index generation successfully scheduled.','Please specify an email address','An email will be sent to {0} upon completion.'];
    var answer = msg.getMessages(values);

    if (!isValid(answer['Please specify an email address']))
      return false;

	var emailTo = gel('email').value;
    scheduleUpgrade(emailTo);

	var success = answer['Text index generation successfully scheduled.'];
	if (getNotification() == 'email')
       success += " " + formatMessage(answer['An email will be sent to {0} upon completion.'], emailTo);
    alert(success);

	GlideDialogWindow.get().destroy();
    return false;
}

function scheduleUpgrade(emailTo) {
    var ga = new GlideAjax('ScheduleEvent');
    ga.addParam('sysparm_name','scheduleIR');
    ga.addParam('sysparm_table','');
    ga.addParam('sysparm_event','upgradeCalgary');
    ga.addParam('sysparm_value',emailTo);
    ga.getXML(); 
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
