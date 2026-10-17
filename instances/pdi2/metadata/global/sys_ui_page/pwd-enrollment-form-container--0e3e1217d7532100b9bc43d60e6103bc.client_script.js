$j('title').text("${gs.getMessage('Password Reset - Enroll')}");
addLoadEvent(loadPage);
hideTooltip();
var SOFT_PIN_VERIFICATION_TYPE_SYSID = 'a67585845302011017c3ddeeff7b1267';
function loadPage() {
	if ('$[jvar_verification_not_exist]' == 'true') {
		document.location = '$pwd_enroll_error.do?sysparm_error=no_enrollment';
	}
	else {
		$j("#tablabel0").focus();
	}
}

// hide tooltip if text overflow with ellipsis is not active
function hideTooltip () {
    $j(".nav-tabs > li").each(function() {
	    var alink = $j(this).children("a");
	    if (alink.prop("offsetWidth") >= alink.prop("scrollWidth")) {
		    $j(this).attr("title", "");
		}
	});
}

addLateLoadEvent(function() {

	// Needed because of $page
    window.g_form = new GlideForm();

    function displayErrorMessage(msg) {
        g_form.clearMessages();
        g_form.addErrorMessage(msg);
    };

	/**
	 * Displays error messages if any found in the url.
	 */
    function displayErrorMessages(errorMessages) {
        // clear any outstanding messages first.
        g_form.clearMessages();

        // if error message does not exists, then just return.
        if (!errorMessages) {
            return;
        }

        //if error message is defined..
        var str = decodeURIComponent(errorMessages);
        str = str.trim();

        if (str.length == 0) {
            return;
        }

        var messages = str.split('^____^');

        for (var i = 0; i < messages.length; i++) {

            var msg = messages[i];
            msg = msg.trim();

            if (msg.length == 0)
                continue;

            g_form.addErrorMessage(htmlEntities(msg));
        }
    }

	window.displayErrorMessage = displayErrorMessage;
	window.displayErrorMessages = displayErrorMessages;
});


/**
 * Disables field value cache
 */
function disableCache(aForm) {
	aForm.autocomplete = "off";
}

/**
 * Sends a request to the server containing data from the visible and hidden forms. 
 * The logic assumes that the hidden forms with verification ID and such follow each of the
 * visible forms. If a form is not in the validFormsMap then it is skipped.
 */
function sendRequest() {
	var ga = new GlideAjax('PwdAjaxEnrollmentProcessor');
	ga.addParam('sysparm_name', 'enroll');
	ga.addParam('sysparm_silent_request', 'true');
	
	var verificationList = [];
	var forms = document.forms;
	var formIndex = 0;
	var paramIndex = 0;
	var oldForm;
	var currForm;
	
	for (var i = 0; i < forms.length; i++) {
		oldForm = currForm;
		currForm = forms[i];
		
		try {
			// Add params when we find a hidden form that follows a valid visible form
			if (currForm.name.indexOf('hidden_form_') == -1 || !validFormsMap[oldForm.name] ||
			   oldForm.elements['can_submit'].value == 'false') { 
				continue;
			}
		}
		catch(err) {
			continue;
		}
		
		paramIndex = addParams(paramIndex,ga,oldForm, 'sysparm_macro_' + formIndex + '_data');
		paramIndex = addParams(paramIndex,ga,currForm, 'sysparm_macro_' + formIndex + '_info');
		var mandatory = (currForm.elements['mandatory'].value == 'true');
		verificationList.push([currForm.elements['verificationId'].value,
							   currForm.elements['verificationName'].value,
							   mandatory]);
		formIndex++;
	}
	
	ga.addParam('sysparm_form_count', formIndex);
	ga.addParam('sysparm_total_count', paramIndex);
	ga.getXML(handleResponse, null, verificationList);
}

/** Add parameters to the AJAX request (ga) based on the form elements */
function addParams(offset, ga, aForm, formId) {
	var elms = aForm.elements;
	var paramIndex = offset;
	
	for(var i = 0; i < elms.length; i++) {
		try {
			var name = elms[i].name;
			var value = elms[i].value;
			
			if(name == undefined || name == '')
				continue;
			
			var paramName = 'sysparm_param_' + paramIndex;
			var paramVal = formId + ":" + name + '=' + value;
			ga.addParam(paramName, paramVal);
			paramIndex++;
		}
		catch(err) {}
	}
	return paramIndex;
}

function handleResponse(response, verificationList) {
	var isSuccess = 'true';
	var errorMessages = '';
	var mapVerificationIdToType = JSON.parse("${map_verificationId_to_type}");
	for (var i = 0; i < verificationList.length; i++) {
		var verificationId = verificationList[i][0];
		var verificationName = verificationList[i][1];
		var mandatory = verificationList[i][2];
		var res = response.responseXML.getElementsByTagName("_" + verificationId);
	
		try {
			var status  = res[0].getAttribute("status");
			var message = res[0].getAttribute("message");
			if (isSoftPIN(verificationId, mapVerificationIdToType) && status == 'success') {
				gel('pin_changed').value = false;
				lastSubmittedSoftPin = gel('softpin_input').value;
			}
			if (status != 'success') {
				// concat the error messages with ^____^ separator.
				var msg = new GwtMessage().getMessage("Enrollment for {0} failed. The reason: {1}", verificationName, message);
				errorMessages = errorMessages + '^____^' + encodeURIComponent(msg);
				isSuccess = 'false';
			}
		}
		catch(err) {
			//should not happen.
			alert(err.message);
			isSuccess = 'false';
		}
	}
	
	// Redirect the page to the success page if all turn out fine. Stay on the same page without redirecting
	// if only some of the forms passed validation. 
	if (isSuccess == 'true') {
		if (validFormsCount == onSubmitEventHandlers.length)
			window.location = "$pwd_enrollment_success.do";
		return;
	}
		
	displayErrorMessages(errorMessages);
}

function isSoftPIN(verificationId, mapVerificationIdToType) {
  	return mapVerificationIdToType[verificationId] == SOFT_PIN_VERIFICATION_TYPE_SYSID;
}

/**
 * Find the value for the passed variable from the current URL.
 * @param variable
 */
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	//return undefined.
	return;
}
/**
 * Escape unsafe special html characters
 */
function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @method changeTabState
 * @param Number index - the tab index
 * @param Number state - the state to be set 0 - remove 'active' CSS class, 1 - add 'active' CSS class
 */
function changeTabState(index,  state) {
	var labelElement = document.getElementById('tablabel' + index),
	labelContainerElement = document.querySelectorAll('.nav-tabs > li')[index],
	contentElement = document.getElementById('tab' + index);
	
	if (state) {
		labelElement.classList.add('active');
		labelElement.setAttribute('tabIndex', '0');
		labelContainerElement.classList.add('active');
		contentElement.classList.add('active');
		contentElement.setAttribute('aria-hidden', false);
	} else {
		labelElement.classList.remove('active');
		labelElement.setAttribute('tabIndex', '-1');
		labelContainerElement.classList.remove('active');
		contentElement.classList.remove('active');
		contentElement.setAttribute('aria-hidden', true);
	}
}

/**
 * @method tabNavigation
 * @param Number currentTabIndex - the tab index
 * @param Number totalTabs - total number of tabs
 * @param Number rightLeft - tab navigation left arrow or right arrow.
 */
function tabNavigation(currentTabIndex, totalTabs, rightLeft) {
	changeTabState(currentTabIndex, 0);
	// LeftArrow: if you are at the first tab, go to the last tab
	if((currentTabIndex === 0) && (rightLeft === -1)) {
		currentTabIndex = totalTabs;
	}
	// RightArrow: if you are at the last tab, go to the first tab
	else if((currentTabIndex === (totalTabs - 1)) && (rightLeft === 1)) {
		currentTabIndex = -1;
	}
	changeTabState(currentTabIndex + rightLeft, 1);
	document.getElementById('tablabel' + (currentTabIndex + rightLeft)).focus();
}
		
/**
 *
 * This key down event is registered to capture the password reset enrollments tab navigation
 *
 **/
$(document).on('keydown', function(event) {
	var totalTabs = document.querySelectorAll('.nav-tabs > li').length,
	currentTab = event.target.id,
	isNavigationRequired = totalTabs > 1 && currentTab.indexOf('tablabel') !== -1,
	currentTabIndex =  isNavigationRequired && parseInt(currentTab.substr('tablabel'.length)),
	keyCode = event.which;
	
	if (isNavigationRequired) {
		if  (keyCode === 37) { // 37 - left arrow key code
			tabNavigation(currentTabIndex, totalTabs, -1);
		} else if (keyCode === 39) { // 39 - right arrow key code
			tabNavigation(currentTabIndex, totalTabs, 1);
		}
	}
});

/**
 *
 * Tab navigation using click, not keyboard
 *
 **/
$j('.nav-tabs > li').on('click', function(event) {
	var allTabs = document.querySelectorAll('.nav-tabs > li').length,
	currentTab = $j(event.target).closest('li').find('a'),
	currentTabIndex =  parseInt(currentTab[0].id.substr('tablabel'.length));
	
	for(var index=0; index<allTabs; index++) {
		changeTabState(index,  index == currentTabIndex);
	}
	currentTab.focus();
});
