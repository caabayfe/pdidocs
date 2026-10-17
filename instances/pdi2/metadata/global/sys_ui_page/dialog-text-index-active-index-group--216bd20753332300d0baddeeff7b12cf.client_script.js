function validateAndSubmit(group) {
	var answer = new GwtMessage().getMessages(['Text index group activation successfully scheduled.','Please specify an email address','An email will be sent to {0} upon completion.']);
		
	if (!isValid(answer['Please specify an email address']))
			return false;
		
	scheduleActivation(answer['Text index group activation successfully scheduled.'], answer['An email will be sent to {0} upon completion.'], group);
	GlideDialogWindow.get().destroy();
	return false;
}

function scheduleActivation(success, emailSuccess, group) {
    var eventName = "activateIndexGroup";
    var ga = new GlideAjax('ScheduleEvent');
    ga.addParam('sysparm_name', 'scheduleIR');
    ga.addParam('sysparm_table', group);
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
