var callMessages = {};
callMessages["Invalid choice of participants"] = new GwtMessage().getMessage("Invalid choice of participants");
callMessages["This number is already selected"] = new GwtMessage().getMessage("This number is already selected");
callMessages["This user is already selected"] = new GwtMessage().getMessage("This user is already selected");
callMessages["Group you added has already been selected"] = new GwtMessage().getMessage("Group you added has already been selected");
callMessages["One or more users of the Group you added has already been selected"] = new GwtMessage().getMessage("One or more users of the Group you added has already been selected");
callMessages["One or more of the users you added has already been selected"] = new GwtMessage().getMessage("One or more of the users you added has already been selected");
callMessages["Invalid number"] = new GwtMessage().getMessage("Invalid number");
callMessages["The group you selected doesn't have an On-Call Rota defined for this time"] = new GwtMessage().getMessage("The group you selected doesn't have an On-Call Rota defined for this time");
var gList = {};
var followOnCallEscalation = taskParams.followOnCallEscalation;
var conferenceCallGroups = [];
var conferenceCallGroupsUsersMap = {};

// Called when the form loads
addLoadEvent(function() {
	if(taskParams.wb == 'true') {
		if(document.body.addClassName)
			document.body.addClassName('wb');
		var ESC = 27;
		document.addEventListener('keyup', function(e) {
			if(e.keyCode == ESC) {
				window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', {cmd: 'cancel'});
			}
		});
	}
	var userI = gel("sys_display.ref_sys_users");
	userI.setAttribute("aria-label", new GwtMessage().getMessage("Add user"));
	var groupI = gel("sys_display.ref_sys_groups");
	if (groupI)
		groupI.setAttribute("aria-label", new GwtMessage().getMessage("Add group"));
	var dlg = GlideModal.prototype.get("sn_comm_management_conference_call_participants_comm_task");
	var planID, taskID, conferenceCallID, table;
	if(taskParams.wb != 'true') {
		planID = dlg.getPreference("sourcePlan");
		taskID = dlg.getPreference("sourceTask");
		conferenceCallID = dlg.getPreference("conferenceCallID");
		table = dlg.getPreference("commTaskClass");
		followOnCallEscalation = dlg.getPreference("followOnCallEscalation");
	}else {
		planID = taskParams.sourcePlan;
		taskID = taskParams.sourceTask;
		conferenceCallID= taskParams.conferenceCallID;
		table = taskParams.className;
	}

	// clear the slush bucket
	slush.clear();
	slush.ignoreDuplicates = true;

	// show loading dialog until we get a response from our
	// ajax call to retrieve a participant list
	showLoadingIcon();

	// get plan contacts via Ajax
	var ga = new GlideAjax('sn_comm_management.CommTaskNotifyAjax');
	ga.addParam('sysparm_name', 'getRecommendedParticipants');
	ga.addParam('sysparm_id', planID);
	ga.addParam('sysparm_taskId', taskID);
	ga.addParam('sysparm_table', table);
	// get participants for an active conference call
	if (conferenceCallID) {
		ga.addParam('sysparm_ccid', conferenceCallID);
	}
	ga.getXML(loadResponse); //Ajax response callback function
	var counter = 1;
	$j('body').on('click', 'a.icon-preview', function(event) {
		var intervalObj = setInterval(function() {
			counter++;
			var openRecordButton = $j('.popover .popover-header a.pop-over-button');
			if (openRecordButton.length) {
				openRecordButton.attr('target', '_blank');
				clearInterval(intervalObj);
				counter = 1;
			}
			else {
				if (counter > 50) {
					clearInterval(intervalObj); //cancel timer if button not found in 10 seconds
					counter = 1;
				}
			}
		}, 200);
	});
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

// Called when we get a response from the 'addLoadEvent' function
function loadResponse(response) {
	hideLoadingIcon();
	// Process the return XML document and add groups to the left select
	var xml = response.responseXML;
	var items = xml.getElementsByTagName("participant");
	var grpObj = {};
	if (xml.getElementsByTagName("grpObj")[0]) {
		grpObj = JSON.parse(xml.getElementsByTagName("grpObj")[0].getAttribute("grp_obj"));
	}
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



function continueOK() {
	showLoadingIcon();
	var selectedEntities = $("slush_right").options;
	var validSelection = false;
	for(var i = 0; i < selectedEntities.length; i++) {
		if(selectedEntities[i].style.color != 'tomato')
			validSelection = true;
	}
	var slushBucketParticipants = slush.getValues(slush.getRightSelect());
	var selectedParticipants = [];
	if (validSelection == false) {
		alert(callMessages["Invalid choice of participants"]);
		hideLoadingIcon();
	} else {
		conferenceCallGroups = [];
		if (followOnCallEscalation) {
			for (var j = 0; j < slushBucketParticipants.length; j++) {
				var sluchBucketParticipant = slushBucketParticipants[j];
				if (sluchBucketParticipant.indexOf('group_') != -1) {
					//this is group
					var thisGroup = sluchBucketParticipant;
					var users = conferenceCallGroupsUsersMap[thisGroup].users;
					for (var k = 0; k < users.length; k++) {
						var user = users[k];
						if (selectedParticipants.indexOf(user) == -1) {
							selectedParticipants.push(user);
							if (conferenceCallGroups.indexOf(thisGroup.substring(6)) == -1) {
								conferenceCallGroups.push(thisGroup.substring(6));
							}
						}
					}
					var numbers = conferenceCallGroupsUsersMap[thisGroup].numbers;
					for (var l = 0; l < numbers.length; l++) {
						var number = numbers[l];
						if (selectedParticipants.indexOf(number) == -1) {
							selectedParticipants.push(number);
						}
					}
				}
				else {
					if (selectedParticipants.indexOf(sluchBucketParticipant) == -1) {
						selectedParticipants.push(sluchBucketParticipant);
					}
				}
			}
		}
		else {
			selectedParticipants = slushBucketParticipants;
		}
		var dlg = GlideModal.prototype.get('sn_comm_management_conference_call_participants_comm_task');
		var planID, conferenceCallID, table, taskID;
		if(taskParams.wb != 'true') {
			planID = dlg.getPreference("sourcePlan");
			conferenceCallID = dlg.getPreference("conferenceCallID");
			table = dlg.getPreference("commTaskClass");
			taskID = dlg.getPreference("sourceTask");
		}
		else {
			planID = taskParams.sourcePlan;
			conferenceCallID = taskParams.conferenceCallID;
			table = taskParams.className;
			taskID = taskParams.sourceTask;
		}

		var ga = new GlideAjax('sn_comm_management.CommTaskNotifyAjax');
		ga.addParam('sysparm_participants', selectedParticipants.join(","));
		ga.addParam('sysparm_id', planID);
		ga.addParam('sysparm_ccid', conferenceCallID);
		ga.addParam('sysparm_group', JSON.stringify(gList));
		ga.addParam('sysparm_table', table);
		ga.addParam('sysparm_taskId', taskID);
		// start a conference call using Notify plugin by calling client script via Ajax
		if (!conferenceCallID) {
			ga.addParam('sysparm_name', 'initiateConferenceCall');
			ga.getXML(conferenceCallInitiated);
		}

		// add a user to an existing conference call
		if (conferenceCallID) {
			ga.addParam('sysparm_name', 'addToConferenceCall');
			ga.getXML(addParticipantCallback);
		}
	}
}

function attachConferenceCallEscalationWorkflow(conferenceCallGroups, conferenceCallSysId) {
	if (!followOnCallEscalation)
		return;
	if (!conferenceCallGroups)
		conferenceCallGroups = [];
	if (conferenceCallGroups.length > 0) {
		var ga = new GlideAjax('sn_comm_management.CommTaskNotifyAjax');
		ga.addParam('sysparm_conference_sys_id', conferenceCallSysId);
		ga.addParam('sysparm_conference_groups', JSON.stringify(conferenceCallGroups));
		ga.addParam('sysparm_name', 'attachConferenceCallEscalationWorkflow');
		ga.getXML(function() {
			closeConferenceGlideModal("true");
		});
	}
}

// callback function when new conference call is initiated
function conferenceCallInitiated(response) {
	hideLoadingIcon();
	// Process the return XML document and add groups to the left select
	var xml = response.responseXML;
	var items = xml.getElementsByTagName("conference_call");
	var success = items[0].getAttribute("success");
	var conferenceCallLink = items[0].getAttribute("conferenceCallLink");
	var conferenceCallNumber = items[0].getAttribute("conferenceCallNumber");
	if (success == "true" && followOnCallEscalation)
		attachConferenceCallEscalationWorkflow(conferenceCallGroups, items[0].getAttribute("conferenceCallSysId"));
	else
		closeConferenceGlideModal(success);
}

function closeConferenceGlideModal(success) {
	var dlg = GlideModal.prototype.get("sn_comm_management_conference_call_participants_comm_task");
	var invokedFrom;
	if(taskParams.wb != 'true')
		invokedFrom = dlg.getPreference("invokedFrom");
	else
		invokedFrom = 'mim_wb';

	if (invokedFrom == "mim_wb") {
		if (success == "true")
			window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', {cmd: 'ok'});
	}
	else {
		dlg.destroy();
		if (success == "true")
			parent.document.location.reload();
	}
}
// callback function when a conference call participant is added
function addParticipantCallback(response) {
	hideLoadingIcon();

	// Process the return XML document and add groups to the left select
	var xml = response.responseXML;
	var items = xml.getElementsByTagName("conference_call_participant");
	var success = items[0].getAttribute("success");
	if (success == "true" && followOnCallEscalation)
		attachConferenceCallEscalationWorkflow(conferenceCallGroups, items[0].getAttribute("conferenceCallSysId"));
	else
		closeConferenceGlideModal(success);
}

// Called when the 'Cancel' button gets clicked
function continueCancel() {
	// Close the dialog window
	var dlg = GlideModal.prototype.get("sn_comm_management_conference_call_participants_comm_task");
	var invokedFrom;
	if(taskParams.wb != 'true')
		invokedFrom = dlg.getPreference("invokedFrom");
	else
		invokedFrom = 'mim_wb';
	if (invokedFrom == "mim_wb")
		window.NOW.CustomEvent.fireAll('DismissMIMGlideModal', {cmd: 'cancel'});
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

	var ga = new GlideAjax('sn_comm_management.CommTaskNotifyAjax');
	ga.addParam('sysparm_number', number);
	ga.addParam("sysparm_name", 'validateUserOrNumber');
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
	var dlg = GlideModal.prototype.get("sn_comm_management_conference_call_participants_comm_task");
	var ga = new GlideAjax('sn_comm_management.CommTaskNotifyAjax');

	// validate the user/number/group and add to the right side
	ga.addParam("sysparm_name", 'validateAndGetParticipants');
	ga.addParam('sysparm_user_id', userSysId);
	ga.addParam('sysparm_group_id', groupSysId);
	if(taskParams.wb == 'true')
		ga.addParam('sysparm_comm_plan_id', taskParams.sourcePlan);
	else
		ga.addParam('sysparm_comm_plan_id', dlg.getPreference('sourcePlan'));
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
		var groupAlreadySelected = false;
		var oneUserAlreadySelected = false;
		// Loop through item elements and add each item to left slush bucket
		var groupAddedToSluchBucket = false;
		for (var i = 0; i < onCallItems.length; i++) {
			var onCallItem = onCallItems[i];
			var color = onCallItem.getAttribute('color');
			var groupUser = onCallItem.getAttribute('sys_id');
			var type = onCallItem.getAttribute('type');
			gList[groupUser] = onCallItem.getAttribute('group_id');
			if (followOnCallEscalation) {
				var thisGroupId = 'group_' + onCallItem.getAttribute('group_id');
				var o = new Option(onCallItem.getAttribute('name'), thisGroupId);
				o.style.color = color;
				if (groupUser && selected.indexOf(thisGroupId) == -1) {
					if (!conferenceCallGroupsUsersMap[thisGroupId]) {
						conferenceCallGroupsUsersMap[thisGroupId] = {
							users: [],
							numbers: []
						};
					}
					if (type === 'phone_number') {
						conferenceCallGroupsUsersMap[thisGroupId].numbers.push(groupUser);
					}
					else {
						conferenceCallGroupsUsersMap[thisGroupId].users.push(groupUser);
					}
					if (!groupAddedToSluchBucket) {
						groupAddedToSluchBucket = true;
						slush.getRightSelect().options[slush.getRightSelect().options.length] = o;
						slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
					}
				} else if (selected.indexOf(thisGroupId) != -1) {
					groupAlreadySelected = true;
				}
			}
			else {
				var o = new Option(onCallItem.getAttribute('name'), groupUser);
				o.style.color = color;
				if (selected.indexOf(groupUser) == -1) {
					slush.getRightSelect().options[slush.getRightSelect().options.length] = o;
					slush.saveRightValues(slush.getValues(slush.getRightSelect()).join(","));
				}
				else {
					oneUserAlreadySelected = true;
				}
			}
			
		}
		if (groupAlreadySelected)
			alert(callMessages["Group you added has already been selected"]);
		if (oneUserAlreadySelected)
			alert(callMessages["One or more users of the Group you added has already been selected"]);

		gel("ref_sys_groups").value = "";
		gel("sys_display.ref_sys_groups").value = "";
		if (gel("ref_sys_groupsLINK")) {
			gel("ref_sys_groupsLINK").style.visibility = "hidden";
			gel("ref_sys_groupsLINK").style.display = "none";
		}
	}

	if (groupId && group_valid == "false") {
		alert(callMessages["The group you selected doesn't have an On-Call Rota defined for this time"]);
		gel("ref_sys_groups").value = "";
		gel("sys_display.ref_sys_groups").value = "";
		if (gel("ref_sys_groupsLINK")) {
			gel("ref_sys_groupsLINK").style.visibility = "hidden";
			gel("ref_sys_groupsLINK").style.display = "none";
		}
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
				if (gel("ref_sys_usersLINK")) {
					gel("ref_sys_usersLINK").style.visibility = "hidden";
					gel("ref_sys_usersLINK").style.display = "none";
				}
			}
		} else if (gel("sys_display.ref_sys_users").value != "") {
			// this user was already selected
			if (!userAlreadySelected) {
				alert(callMessages["One or more of the users you added has already been selected"]);
				userAlreadySelected = true;
			}

			// clear the user value and remove the reference icon
			gel("sys_display.ref_sys_users").value = "";
			if (gel("ref_sys_usersLINK")) {
				gel("ref_sys_usersLINK").style.visibility = "hidden";
				gel("ref_sys_usersLINK").style.display = "none";
			}
		}
	}
}
