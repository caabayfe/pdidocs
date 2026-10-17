// global variable to make rollback to old notify less painful
var useNotify2 = true;
var callMessages = {};
callMessages["You must select at least one participant"] = new GwtMessage().getMessage("You must select at least one participant");
callMessages["This number is already selected"] = new GwtMessage().getMessage("This number is already selected");
callMessages["This user is already selected"] = new GwtMessage().getMessage("This user is already selected");
callMessages["One or more of the users you added has already been selected"] = new GwtMessage().getMessage("One or more of the users you added has already been selected");
callMessages["Invalid number"] = new GwtMessage().getMessage("Invalid number");
callMessages["The group you selected doesn't have an On-Call Rota defined for this time"] = new GwtMessage().getMessage("The group you selected doesn't have an On-Call Rota defined for this time");
var gList = {};

// Called when the form loads
addLoadEvent(function() {
    var userI = gel("sys_display.ref_sys_users");
    userI.setAttribute("aria-label", new GwtMessage().getMessage("Add user"));
    var groupI = gel("sys_display.ref_sys_groups");
    if (groupI)
        groupI.setAttribute("aria-label", new GwtMessage().getMessage("Add group"));
    var dlg = GlideModal.get();
    var sourceID = dlg.getPreference("sourceID");
    var conferenceCallID = dlg.getPreference("conferenceCallID");
    // clear the slush bucket
    slush.clear();
    slush.ignoreDuplicates = true;

    // show loading dialog until we get a response from our
    // ajax call to retrieve a participant list
    showLoadingIcon();

    // get frequent participants and IA contacts via Ajax
    var ga = new GlideAjax(getAjaxProcessor());
    ga.addParam('sysparm_name', (useNotify2) ? 'getRecommendedParticipants' : 'getRecommendedParticipantsAjax');
    ga.addParam('sysparm_id', sourceID);

    // get participants for an active conference call
    if (conferenceCallID) {
        ga.addParam('sysparm_ccid', conferenceCallID);
    }

    ga.getXML(loadResponse); //Ajax response callback function
});

function showLoadingIcon() {
    var loading = document.getElementById("loading");
    loading.style.display = "block";
    var content = document.getElementById("content");
    content.style.display = "none";
}

function hideLoadingIcon() {
    var loading = document.getElementById("loading");
    loading.style.display = "none";
    var content = document.getElementById("content");
    content.style.display = "block";
}
// get the ajax processor to use
function getAjaxProcessor() {
    return ((useNotify2) ? 'IncidentAlertNotifyAjax' : 'IncidentAlertConferenceCall');
}

// Called when we get a response from the 'addLoadEvent' function
function loadResponse(response) {
    hideLoadingIcon();
    // Process the return XML document and add groups to the left select
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("participant");
    var grpObj = JSON.parse(xml.getElementsByTagName("grpObj")[0].getAttribute("grp_obj"));
    for (var id in grpObj)
        gList[id] = grpObj[id];

    if (items.length == 0) {
        return;
    }

    // Loop through item elements and add each item to left slush bucket
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var color = item.getAttribute('color');

        // check if the participant should be added to the available (left)
        // or selected (right) list
        if (item.getAttribute('side') == "left") {
            slush.addLeftChoice(item.getAttribute('sys_id'), item.getAttribute('name'));
            slush.getLeftSelect().options[slush.getLeftSelect().options.length - 1].style.color = color;
        } else {
            var o = new Option(item.getAttribute('name'), item.getAttribute('sys_id'));
            o.style.color = color;
            slush.getRightSelect().options[slush.getRightSelect().options.length] = o;
        }
    }

    // get and save the selected values on the right of the slush bucket
    var array = slush.getValues(slush.getRightSelect());
    var r = array.join(",");
    slush.saveRightValues(r);
}

/**
 * Called when the 'OK' button gets clicked
 * do some checking here to make sure there are some participants
 * on the right side of the slush bucket
 */
function continueOK() {
    showLoadingIcon();
    var selectedParticipants = slush.getValues(slush.getRightSelect());
    var validSelection = selectedParticipants.length > 0;

    // make sure at least 1 user is on the right side of the slush bucket
    if (!validSelection) {
        alert(callMessages["You must select at least one participant"]);
        hideLoadingIcon();
    } else {
        var dlg = GlideModal.get();
        var sourceID = dlg.getPreference("sourceID");
        var conferenceCallID = dlg.getPreference("conferenceCallID");

        var ga = new GlideAjax(getAjaxProcessor());
        ga.addParam('sysparm_participants', selectedParticipants.join(","));
        ga.addParam('sysparm_id', sourceID);
        ga.addParam('sysparm_ccid', conferenceCallID);
        ga.addParam('sysparm_group', JSON.stringify(gList));
        // start a conference call using Notify plugin by calling client script via Ajax
        if (!conferenceCallID) {
            ga.addParam('sysparm_name', (useNotify2) ? 'initiateConferenceCall' : 'initiateConferenceCallAjax');
            ga.getXML(conferenceCallInitiated);
        }

        // add a user to an existing conference call
        if (conferenceCallID) {
            ga.addParam('sysparm_name', (useNotify2) ? 'addToConferenceCall' : 'addToConferenceCallAjax');
            ga.getXML(addParticipantCallback);
        }
    }
}

// callback function when new conference call is initiated
function conferenceCallInitiated(response) {
    hideLoadingIcon();
    // Process the return XML document and add groups to the left select
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("conference_call");
    var success = items[0].getAttribute("success");
    var dlg = GlideModal.prototype.get("conference_call_participants");
    var invokedFrom = dlg.getPreference("invokedFrom");
    if (invokedFrom == "mim_wb")
        window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', true);
    else
        dlg.destroy();

    if (success == "true")
        window.location.reload();
}

// callback function when a conference call participant is added
function addParticipantCallback(response) {
    hideLoadingIcon();

    // Process the return XML document and add groups to the left select
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("conference_call_participant");
    var success = items[0].getAttribute("success");
    var dlg = GlideModal.prototype.get("conference_call_participants");
    var invokedFrom = dlg.getPreference("invokedFrom");
    if (invokedFrom == "mim_wb")
        window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', true);
    else
        dlg.destroy();

    window.location.reload();
}

// Called when the 'Cancel' button gets clicked
function continueCancel() {
    // Close the dialog window
    var dlg = GlideModal.prototype.get("conference_call_participants");
    var invokedFrom = dlg.getPreference("invokedFrom");
    if (invokedFrom == "mim_wb")
        window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', true);
    else
        dlg.destroy();
    return false;
}

// Validate E.164 format
function validateNumber() {
    var number = gel("notifynow_participant.phone_number").value;
    if (!number) {
        gel("notifynow_participant.phone_number").className = "form-control";
        gel("notifynow_participant.phone_number").title = "";
        return;
    }

    var ga = new GlideAjax(getAjaxProcessor());
    ga.addParam('sysparm_number', number);
    ga.addParam("sysparm_name", (useNotify2) ? 'validateUserOrNumber' : 'validateUserOrNumberAjax');
    ga.getXML(validateNumberCallBack);
}

// Validate E.164 format callback
function validateNumberCallBack(response) {
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("validated");
    var valid = items[0].getAttribute("number_valid");

    if (valid != "false") {
        gel("notifynow_participant.phone_number").className = "form-control";
        gel("notifynow_participant.phone_number").title = "";
        gel("notifynow_participant.phone_number").value = valid;
    } else {
        gel("notifynow_participant.phone_number").className = "form-control element_reference_input ref_invalid";
        gel("notifynow_participant.phone_number").title = callMessages["Invalid number"];
    }

}

// Add a User or number to selected side of slush bucket
function addToSelected() {
    var number = gel("notifynow_participant.phone_number").value;
    var userSysId = gel("ref_sys_users").value;
    var groupSysId = gel("ref_sys_groups") ? gel("ref_sys_groups").value : '';
    var ga = new GlideAjax(getAjaxProcessor());

    // validate the user/number/group and add to the right side
    ga.addParam("sysparm_name", (useNotify2) ? 'validateAndGetParticipants' : 'validateUserOrNumberAjax');
    ga.addParam('sysparm_user_id', userSysId);
    ga.addParam('sysparm_group_id', groupSysId);
    ga.addParam('sysparm_number', number);
    ga.getXML(addNumberUserOrGroup);
}

// add number and users to slush bucket
function addNumberUserOrGroup(response) {
    var addBtn = gel("add_to_selected");
    addBtn.blur();
    var okBtn = gel("ok_button");
    okBtn.focus();
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("validated");
    var number_valid = items[0].getAttribute("number_valid");
    var user_valid = items[0].getAttribute("user_valid");
    var group_valid = items[0].getAttribute("group_valid");
    var userSysId = gel("ref_sys_users").value;
    var groupId = gel("ref_sys_groups") ? gel("ref_sys_groups").value : '';
    var selected;
    var rightValues;
    var userAlreadySelected = false;
    if (number_valid != "false") {
        var phoneNumber = gel("notifynow_participant.phone_number").value;
        rightValues = slush.getValues(slush.getRightSelect()).join();
        var option;
        selected = rightValues.split(",");
        var userNumber = items[0].getAttribute("number_user");
        var userNumberDisplay = items[0].getAttribute("number_user_display");
        if (userNumber && selected.indexOf(userNumber) == -1) {
            option = new Option(userNumberDisplay, userNumber);
            slush.getRightSelect().options[slush.getRightSelect().options.length] = option;
            slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
        } else if (!userNumber && phoneNumber && selected.indexOf(phoneNumber) == -1) {
            option = new Option(phoneNumber, phoneNumber);
            slush.getRightSelect().options[slush.getRightSelect().options.length] = option;
            slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
        } else if (userNumber || phoneNumber) {
            alert(callMessages["This number is already selected"]);
        }

        gel("notifynow_participant.phone_number").value = "";
        gel("notifynow_participant.phone_number").className = "form-control";
        gel("notifynow_participant.phone_number").title = "";
    } else if (gel("notifynow_participant.phone_number").value != "") {
        gel("notifynow_participant.phone_number").className = "form-control element_reference_input ref_invalid";
        gel("notifynow_participant.phone_number").title = callMessages["Invalid number"];
    }

    if (group_valid != "false") {
        rightValues = slush.getValues(slush.getRightSelect()).join();
        selected = rightValues.split(",");
        var onCallItems = xml.getElementsByTagName("on_call_participant");

        // Loop through item elements and add each item to left slush bucket
        for (var i = 0; i < onCallItems.length; i++) {
            var onCallItem = onCallItems[i];
            var color = onCallItem.getAttribute('color');
            var groupUser = onCallItem.getAttribute('sys_id');
            var o = new Option(onCallItem.getAttribute('name'), groupUser);
            o.style.color = color;
            if (groupUser && selected.indexOf(groupUser) == -1) {
                slush.getRightSelect().options[slush.getRightSelect().options.length] = o;
                slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
                gList[groupUser] = groupId;
            } else if (selected.indexOf(groupUser) != -1) {
                userAlreadySelected = true;
            }
        }
        if (userAlreadySelected)
            alert(callMessages["One or more of the users you added has already been selected"]);

        gel("ref_sys_groups").value = "";
        gel("sys_display.ref_sys_groups").value = "";
        gel("ref_sys_groupsLINK").style.visibility = "hidden";
        gel("ref_sys_groupsLINK").style.display = "none";
    }

    if (groupId && group_valid == "false") {
        alert(callMessages["The group you selected doesn't have an On-Call Rota defined for this time"]);
        gel("ref_sys_groups").value = "";
        gel("sys_display.ref_sys_groups").value = "";
        gel("ref_sys_groupsLINK").style.visibility = "hidden";
        gel("ref_sys_groupsLINK").style.display = "none";
    }

    // got a user?
    if (userSysId) {
        // is the user already selected on the right side ?
        rightValues = slush.getValues(slush.getRightSelect()).join();
        selected = rightValues.split(",");
        if (selected.indexOf(userSysId) == -1) {
            var user = new GlideRecord("sys_user");

            if (user.get(userSysId)) {
                // new option DOM element to add to slush bucket
                var option = new Option(user.name, userSysId);

                // check if the user selected has a mobile phone number
                if (user_valid == "false") {
                    option.style.color = "tomato";
                }

                // add the new option element to the right side of the slush bucket and save
                // all selected user ids
                slush.getRightSelect().options[slush.getRightSelect().options.length] = option;
                slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
                // clear the user value and remove the reference icon
                gel("sys_display.ref_sys_users").value = "";
                gel("ref_sys_usersLINK").style.visibility = "hidden";
                gel("ref_sys_usersLINK").style.display = "none";
            }
        } else if (gel("sys_display.ref_sys_users").value != "") {
            // this user was already selected
            if (!userAlreadySelected) {
                alert(callMessages["One or more of the users you added has already been selected"]);
                userAlreadySelected = true;
            }

            // clear the user value and remove the reference icon
            gel("sys_display.ref_sys_users").value = "";
            gel("ref_sys_usersLINK").style.visibility = "hidden";
            gel("ref_sys_usersLINK").style.display = "none";
        }
    }
}
