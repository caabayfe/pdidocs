var passwordFieldDisabled = $[jvar_password_field_disabled];
document.getElementById("set_password").disabled = true;
document.getElementById("password").disabled = passwordFieldDisabled;
var userID = GlideModal.get().getPreference('sysparm_user')? GlideModal.get().getPreference('sysparm_user') : g_user.userID;

function generatePassword() {
    if (!userID){
		showMessage(new GwtMessage().getMessage("Not a valid user."), "error");
		return;
    }


    var ga = new GlideAjax('PasswordPolicyUtil');
    ga.addParam('sysparm_name', 'generatePassword');
    ga.addParam('sysparm_user', userID);
    ga.getXMLWait();
    var password = ga.getAnswer();
    if (password == 'false' || password == "") {
        showMessage(new GwtMessage().getMessage("password generation failed."), "error");
    } else {
        document.getElementById("password").value = password;
        showMessage(new GwtMessage().getMessage("Password generated succesfully."), "info");
        document.getElementById("set_password").disabled = false;
    }
}

function setPassword() {
    //Set up the user password with the password present in the input field
    if (!userID){
	showMessage(new GwtMessage().getMessage("Not a valid user."), "error");
	return;
    }
    var password = document.getElementById("password").value;
    var ga = new GlideAjax('PasswordPolicyUtil');
    ga.addParam('sysparm_name', 'setPassword');
    ga.addParam('sysparm_user', userID); //Parm1
    ga.addParam('sysparm_password', password); //Parm2
    ga.getXML(this.processResponse.bind(this));
    return false;
}

function processResponse(response) {
    var outputs = response.responseXML.getElementsByTagName("output");
    if (outputs && outputs.length > 0) {
        var success = outputs[0].getAttribute("success");
        var msg = outputs[0].getAttribute("message");
        if (success == "false") {
            showMessage(msg, "error");
        } else {
            showMessage(msg, "info");
        }
        return;
    }
}

function showMessage(msg, type) {
    var notificationContainer = gel("divNotification");
    if (type == 'info')
        notificationContainer.setAttribute("class", "notification notification-success");
    else if (type == 'error')
        notificationContainer.setAttribute("class", "notification notification-error");
    notificationContainer.style.display = "block";
    notificationContainer.innerText = msg;
}


function copyPassword(curr) {
    var password = document.getElementById("password").value;
    if (!password)
        showMessage(new GwtMessage().getMessage("Password is empty."), "error");
    else
        copy(password);
}

function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        showMessage(new GwtMessage().getMessage("Password copied successfully."), "info");
    } else {
        showMessage(new GwtMessage().getMessage("Password could not be copied to clipboard."), "error");
    }
    document.getElementById("copy_code").focus();

}

$('password').observe('keyup',
    function() {
        var password = document.getElementById("password").value;
        if (password) {
            document.getElementById("set_password").disabled = false;
        } else {
            document.getElementById("set_password").disabled = true;
        }
    });

function renderMaskIcon(element) {
    var passwordEle = document.getElementById("password");
    var maskEle = document.getElementById("mask_icon");
    var btnDescription = document.getElementById("btnDescription");
    var isPasswordType = passwordEle.type === 'password';
    maskEle.classList.toggle('active', isPasswordType);
    maskEle.setAttribute("data-original-title", (isPasswordType) ? "${gs.getMessage('Hide password')}" : "${gs.getMessage('Show password')}");
    element.setAttribute("aria-label", (isPasswordType) ? "${gs.getMessage('Hide password')}" : "${gs.getMessage('Show password')}");
    passwordEle.type = (isPasswordType) ? 'text' : 'password';
    btnDescription.textContent = (isPasswordType) ? "${gs.getMessage('Password shown')}" : "${gs.getMessage('Password hidden')}";
}

document.addEventListener('click', function(e) {
    if (e.target.matches('[data-dismiss="GlideModal"]')) {
        location.reload();
    }
});
