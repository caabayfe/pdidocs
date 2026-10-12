function validateAndSubmit(table) {
	var msg = new GwtMessage();
	var values = ['Document frequency generation successfully scheduled.','Please specify an email address','An email will be sent to {0} upon completion.'];
	var answer = msg.getMessages(values);
		
	if (!isValid(answer['Please specify an email address']))
			return false;
		
	scheduleRegen(answer['Document frequency generation successfully scheduled.'], answer['An email will be sent to {0} upon completion.'], table);
	GlideDialogWindow.get().destroy();
	return false;
}

function scheduleRegen(success, emailSuccess, table) {
    var eventName = "build_doc_freq";
    var ga = new GlideAjax('ScheduleEvent');
    ga.addParam('sysparm_name', 'scheduleIR');
    ga.addParam('sysparm_table', table);
    ga.addParam('sysparm_event', eventName);
    ga.addParam('sysparm_value', gel("email").value);
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
    for (var i = 0; i < a.length; i++)
        if (a[i].checked)
            return a[i].value;
}
