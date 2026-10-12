addLoadEvent(initializeDynamicForm);

(function() {
    var form = gel('form.e2ce4b4a872233001bf5bd6ec7cb0b6f');
    var list = form.querySelectorAll('[aria-required="true"]');
    if(list == null)
        gel('createConCred').removeAttribute('disabled');
    var mandatoryChecker = {};
    for (var i = 0; i < list.length; i++) {

        if (!list[i].value)
            mandatoryChecker[list[i].id] = true;

        list[i].addEventListener("keyup", function(event) {

            if (event.target.value.trim())
                delete mandatoryChecker[event.target.id];
            else
                mandatoryChecker[event.target.id] = true;

            if (!allMandatoryInputted(mandatoryChecker))
                gel('createConCred').setAttribute('disabled', 'disabled');
            else
                gel('createConCred').removeAttribute('disabled');
        });
    }

	var radioFields = form.querySelectorAll('input[type="radio"]');
	radioFields.forEach(function(radioInput) {
		radioInput.addEventListener('change', function(event) {
			if (event.target.checked) {
				if (!allMandatoryInputted(mandatoryChecker))
					gel('createConCred').setAttribute('disabled', 'disabled');
				else
					gel('createConCred').removeAttribute('disabled');
			}
		});
	});

    if (allMandatoryInputted(mandatoryChecker))
        gel('createConCred').removeAttribute('disabled');
})();

function initializeDynamicForm() {
    var dynamicDataSchemaJSON = GlideModal.get().getPreference('dynamicDataSchemaJSON');

    var connectionFields = dynamicDataSchemaJSON.connection_fields;
    var credentialFields = dynamicDataSchemaJSON.credential_fields;
    var additionalFields = dynamicDataSchemaJSON.additional_fields;
    setOAuthRedirectURLdefaultValue(dynamicDataSchemaJSON);

    if (!connectionFields && !credentialFields && !additionalFields)
        generateConnectionAndCredential(null); //this will generate the CC records using only the default data
}

function doesJsonArrayContainObjectWithName(jsonArray, objectName) {
    if (!jsonArray) {
        return;
    }

    return jsonArray.some(function(obj) {
        return obj.name.includes(objectName);
    });
}

function setOAuthRedirectURLdefaultValue(dynamicDataSchemaJSON) {
    var redirectURLElementName = 'credential.oauth_entity.redirect_url';
    if (!doesJsonArrayContainObjectWithName(dynamicDataSchemaJSON.credential_fields, redirectURLElementName))
        return;

    var ajax = new GlideAjax("AuthenticationHelper");
    ajax.addParam('sysparm_name', 'getInstanceURL');
    ajax.getXMLAnswer(processRedirectURLResponse);
}

function processRedirectURLResponse(url) {
    var redirectURLElementName = 'credential.oauth_entity.redirect_url';
    if (url) {
        url += '/oauth_redirect.do';
    } else {
        url = g_navigation.getURL().split(/[/?]/);
        url = url[0] + '//' + url[2] + '/oauth_redirect.do';
    }
    gel(redirectURLElementName).value = url;
}

function createConnectionAndCredential() {
    var dynamicDataSchemaJSON = GlideModal.get().getPreference('dynamicDataSchemaJSON');
    var formDataJSON = {};
    var errorMsg;
    var errorRecord = {
        emptyFields: []
    };

    generateFormDataFromFields(formDataJSON, dynamicDataSchemaJSON.connection_fields, errorRecord);

    generateFormDataFromFields(formDataJSON, dynamicDataSchemaJSON.credential_fields, errorRecord);

    generateFormDataFromFields(formDataJSON, dynamicDataSchemaJSON.additional_fields, errorRecord);


    if (errorRecord.emptyFields.length > 0) {
        errorMsg = new GwtMessage().getMessage('The following mandatory fields are not filled in: {0}', errorRecord.emptyFields.join(", "));
        showInlineError(errorMsg);
        return false;
    }

    var formData = JSON.stringify(formDataJSON);
    generateConnectionAndCredential(formData);
    return false;
}


function generateFormDataFromFields(formDataJSON, fields, errorRecord) {

    if (!fields)
        return true;

    var field;
    for (var i = 0; i < fields.length; i++) {
        field = fields[i];

        if (field.type == 'mid_selection')
            processMIDField(formDataJSON, field, errorRecord);

        else if (field.type == 'radio')
            flattenAndProcessRadioFields(formDataJSON, field, errorRecord);
        else
            processField(formDataJSON, field, errorRecord);
    }

    return true;
}

function processField(formDataJSON, field, errorRecord) {
    var fieldName = field.name;
    var fieldValue = '';
    var fieldLabel = field.label;

    if (field.type == 'file')
        fieldValue = gel("b64-" + fieldName).value;
    else
        fieldValue = gel(fieldName).value;

    if (validateField(field, fieldValue, errorRecord))
        formDataJSON[fieldName] = fieldValue;
}

function processMIDField(formDataJSON, field, errorRecord) {
    var useMid = gel("connection.use_mid").value == 'true';
    formDataJSON["connection.use_mid"] = useMid;
    formDataJSON["connection.mid_selection"] = "specific_mid_server";
    formDataJSON["connection.mid_server"] = gel("connection.mid_server").value;
}

function flattenAndProcessRadioFields(formDataJSON, radioGroup, errorRecord) {

    var groups = radioGroup.groups;

    var groupIds = getRadioButtonIds(groups);
    var activeGroupId = getActiveRadioButtonId(groupIds);
    var fields = getFieldsWithRadioButtonId(groups, activeGroupId);

    flattenRadioFields(formDataJSON, radioGroup.name, fields, activeGroupId, errorRecord);

    return true;
}

function flattenRadioFields(formDataJSON, radioGroupName, fields, groupId, errorRecord) {
    var doc = gel(groupId);
    var fieldValue = '';
    formDataJSON[radioGroupName] = groupId; // Inserting so that backend can determine which group was selected

    for (var i = 0; i < fields.length; i++) {
        var fieldId = fields[i].name;
        fieldValue = getRadioFieldValue(groupId, fieldId);
        if (validateField(fields[i], fieldValue, errorRecord))
            formDataJSON[fieldId] = fieldValue;
    }
}

function getRadioButtonIds(groups) {
    var groupIds = [];
    groups.forEach(function(group) {
        groupIds.push(group.name);
    });

    return groupIds;
}

function getActiveRadioButtonId(groupIds) {
    var checkedId = "";
    groupIds.forEach(function(groupId) {
        if (gel(groupId).checked) {
            checkedId = groupId;
        }
    });

    return checkedId;
}

function getFieldsWithRadioButtonId(groups, groupId) {
    var fields = [];
    groups.forEach(function(group) {
        if (group.name == groupId) {
            fields = group.fields;
        }
    });

    return fields;
}

function getRadioFieldValue(groupId, fieldId) {
    var elementName = groupId + "-" + fieldId;
    var radioElement = gel(elementName);

    var value = "";

    if (radioElement.type == 'file') {
        value = gel("b64-" + elementName).value;
    } else {
        value = radioElement.value;
    }

    return value;
}

function generateConnectionAndCredential(formData) {
    var ajax = new GlideAjax("ConnectionAndCredentialHelper");
    ajax.addParam("sysparm_name", "createConnectionAndCredential");
    ajax.addParam("sysparm_formData", formData);
    ajax.addParam("sysparm_aliasSysID", GlideModal.get().getPreference('connectionAliasSysID'));
    ajax.getXMLAnswer(this.processResponse.bind(this));
}

function processResponse(response) {
    var result = JSON.parse(response);

    var errorMessage;
    if (!result) {
        errorMessage = getMessage("Unexpected Server response");
        result = {
            status: "FAIL",
            message: errorMessage
        };
    }

    if (result.status == 'SUCCESS') {
        var connectionSysId = result["sysId"];
        GlideModal.get().destroy();
        getOAuthTokenFromServiceProvider(connectionSysId);
        return;
    }

    var error = new GwtMessage().getMessage('Failed to create a new connection and credential with this configuration template. {0}', result["message"]);
    g_form.addErrorMessage(error);
    GlideModal.get().destroy();
}


function closeModalPopup() {
    GlideModal.get().destroy();
}

function getOAuthTokenFromServiceProvider(connectionSysId) {
    var ajax = new GlideAjax("ConnectionAndCredentialHelper");
    ajax.addParam("sysparm_name", "getOAuthEntityProfileFromConnection");
    ajax.addParam("sysparm_connection_sys_id", connectionSysId);
    ajax.getXML(this.processOAuthProfileAndGrantTypeResponse.bind(this));
}

function processOAuthProfileAndGrantTypeResponse(response) {
    var result = response.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var grantType = result[0].getAttribute('grant_type');
        var oauthProfileId = result[0].getAttribute('oauth_entity_profile_id');
        var oauthCredentialId = result[0].getAttribute('oauth_credentials_sys_id');
        var oauthRequestorSysId = oauthCredentialId;
        var useMID = result[0].getAttribute('use_mid');
        if (oauthProfileId) {
            var oauthRequestorContext = 'oauth_2_0_credentials';
            var oauth_initiator_url = '';
            if (grantType === 'password') {
                oauth_initiator_url = '/oauth_password_input.do' +
                    '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
                    '&sysparm_oauth_requestor=' + oauthRequestorSysId +
                    '&sysparm_oauth_provider_profile=' + oauthProfileId;

                if (useMID == 'true') {
                    var capableMid = result[0].getAttribute("mid_server");
                    if (capableMid == null || capableMid == "") {
                        g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                        return;
                    } else
                        oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
                }
            } else if (grantType === 'client_credentials') {
                oauth_initiator_url = '/oauth_client_credentials_input.do' +
                    '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
                    '&sysparm_oauth_requestor=' + oauthRequestorSysId +
                    '&sysparm_oauth_provider_profile=' + oauthProfileId;

                if (useMID == 'true') {
                    var capableMid = result[0].getAttribute("mid_server");
                    if (capableMid == null || capableMid == "") {
                        g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                        return;
                    } else
                        oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
                }
            } else if (grantType === 'urn:ietf:params:oauth:grant-type:token-exchange') {
                oauth_initiator_url = '/oauth_token_exchange_input.do' +
                    '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
                    '&sysparm_oauth_requestor=' + oauthRequestorSysId +
                    '&sysparm_oauth_provider_profile=' + oauthProfileId;

                if (useMID == 'true') {
                    var capableMid = result[0].getAttribute("mid_server");
                    if (capableMid == null || capableMid == "") {
                        g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                        return;
                    } else
                        oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
                }
            } else if (grantType === 'authorization_code') {
                oauth_initiator_url = '/oauth_initiator.do' +
                    '?oauth_requestor_context=' + oauthRequestorContext +
                    '&oauth_requestor=' + oauthRequestorSysId +
                    '&oauth_provider_profile=' + oauthProfileId +
                    '&response_type=code';

                if (useMID == 'true') {
                    var capableMid = result[0].getAttribute("mid_server");
                    if (capableMid == null || capableMid == "") {
                        g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                        return;
                    } else
                        oauth_initiator_url += '&use_mid=true&mid_server=' + capableMid;
                }
            } else if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') { // To Handle JWT Bearer Grant Type
                oauth_initiator_url = '/oauth_jwt_bearer_input.do' +
                    '?sysparm_oauth_requestor_context=' + oauthRequestorContext +
                    '&sysparm_oauth_requestor=' + oauthRequestorSysId +
                    '&sysparm_oauth_provider_profile=' + oauthProfileId;

                if (useMID == 'true') {
                    var capableMid = result[0].getAttribute("mid_server");
                    if (capableMid == null || capableMid == "") {
                        g_form.addErrorMessage('No valid mid server with REST capability available. Please refer to ' + '<a target="_blank" href="https://docs.servicenow.com/csh?context=CSHelp:CreateMIDServerCapability">Configure MID Server capabilities</a>');
                        return;
                    } else
                        oauth_initiator_url += '&sysparm_use_mid=true&sysparm_mid_server=' + capableMid;
                }
            } else {
                g_form.addErrorMessage(getMessage('Unsupported OAuth grant type: {0}.', grantType));
                return;
            }
            window.open(oauth_initiator_url, '', 'height=500,width=800'); // pops up window
            return;
        }
    } else {
        window.location.reload();
        return;
    }
}

function validateField(field, fieldValue, errorRecord) {
    var mandatory = typeof field.mandatory === 'undefined' || field.mandatory;

    if (!mandatory) {
        return true;
    }

    var fieldLabel = field.label;
    if (!fieldValue) {

        errorRecord.emptyFields.push(fieldLabel);
        return false;
    }
    return true;
}

function allMandatoryInputted(mandatoryChecker) {
	if(Object.keys(mandatoryChecker).length == 0)
		return true;
	
	for(var key in mandatoryChecker) {
		if(isElementVisibleOnForm(key))
			return false;
		else
			continue;
	}
	return true;
}

function isElementVisibleOnForm(element) {
  var currentElement = gel(element);
  while (currentElement) {
	//Element and its parents visibility is verified, return false if any of its parent is hidden causing the element hidden
    var computedStyle = window.getComputedStyle(currentElement);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0')
		return false;
	else
      currentElement = currentElement.parentElement;
  }
  return true;
}

function showInlineError(message) {
    gel("errorMessageBlock").style.display = "block";
    gel("lblError").innerHTML = " " + message;
}
