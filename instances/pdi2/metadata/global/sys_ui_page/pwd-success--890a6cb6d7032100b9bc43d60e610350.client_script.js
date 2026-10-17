setViewportForMobile();
$j('title').text("${gs.getMessage('Password Reset - Success')}");

function renderMaskIcon(element, inputFieldId) {
    var passwordEle = document.getElementById(inputFieldId);
    var maskEleId = element.getAttribute("id");
    var maskEle = document.getElementById(maskEleId);
    var isPasswordType = passwordEle.type === 'password';
    var maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide password')}";
    var maskBtnShowPwdAriaLabel = "${gs.getMessage('Show password')}";
    maskEle.classList.toggle('active', isPasswordType);
    maskEle.setAttribute("data-original-title", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    element.setAttribute("aria-label", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    passwordEle.type = (isPasswordType) ? 'text' : 'password';
}

function showHidePhoneticReading() {
	var pwdElement = gel("new_autogenerate_password");
	var phoneticPasswordElement = gel("phonetic_view");
	if(pwdElement && phoneticPasswordElement) {
		phoneticPasswordElement.hidden = pwdElement.type === 'password';
	}
}
