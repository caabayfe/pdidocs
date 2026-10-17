function validateAndSubmit() {
	var answer = new GwtMessage().getMessages(['Child table migration is successfully scheduled.','Please specify an email address.','An email will be sent to {0} upon completion.']);
		
	if (!isValid(answer['Please specify an email address.']))
		return false;
	
	var gm = GlideModal.prototype.get('ais_migrate_child_table');
	var childTable = gm.getPreference('child_table_name');
	scheduleActivation(answer['Child table migration is successfully scheduled.'], answer['An email will be sent to {0} upon completion.'], childTable);
	GlideModal.get().destroy();
	return true;
}

function scheduleActivation(success, emailSuccess, childTable) {
    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'scheduleChildTableMigration');
    ga.addParam('sysparm_child_table', childTable);
    ga.addParam('sysparm_email', gel("email").value);
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
