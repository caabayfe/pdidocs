var spMap = {};
var TELEPHONY_PROVIDER = 'Telephony';
var fromNumber = '';
var message = "";
var callMessages = i18n_translations;
var siProcessor = "global.NotifyOnTaskAjaxProcessor_V2";
var uiPage = "notify_conference_dialog";
var gInputData = {};
var gItemsList = [];
var groupMap = {};
var idMap = {};
var NOTIFY_CONFERENCE_DIALOG_MSG = 'NOTIFY_CONFERENCE_DIALOG_MSG';
var spCount = 0;
var validParticipants = 'valid-participant';
var invalidParticipants = 'invalid-participant';

gInputData.siProcessor = gInputData.siProcessor || siProcessor;
if(typeof currentConfSPName == 'undefined')
	currentConfSPName = '';
	
for(var prop in data)
	gInputData[prop] = data[prop];


function isMobile() {
	var ua = window.navigator.userAgent;
	if( ua.match(/Android/i) ||
		ua.match(/webOS/i) ||
		ua.match(/iPhone/i) ||
		ua.match(/iPad/i) ||
		ua.match(/iPod/i) ||
		ua.match(/BlackBerry/i) ||
		ua.match(/Windows Phone/i))
			return true;
		return false;
}
		
function addToAvailableList(newList) {
	for(var i = 0; i < newList.length; i++) {
		if(newList[i].users) {
			groupMap[newList[i].id] = newList[i];
			for(var j = 0; j < newList[i].users.length; j++) {
				// Adding group information as well in the idMap object to denote addition via a Group - DEF0172965
				if(!newList[i].showGroupName) {
					newList[i].users[j].groupId = newList[i].id;
				}
				idMap[newList[i].users[j].id] = newList[i].users[j];
			}
			continue;
		}
		idMap[newList[i].id] = newList[i];
	}
	gItemsList = gItemsList.concat(newList);
}
function enableSelectButton() {
	$j('#add_to_selected').removeAttr('disabled');
	
}
function disableSelectButton() {
	$j('#add_to_selected').attr('disabled', 'true');
	
}

function showElement(el){
	if(el)
		el.style.display = 'block';
}

function hideElement(el){
	if(el)
		el.style.display = 'none';
}

function enableInvalidUserMessage(){
	var invalidUserMessageMobile = document.getElementById('invalidUserMessageMobile');
	var invalidUserMessage = document.getElementById('invalidUserMessage');
	showElement(invalidUserMessage);
	hideElement(invalidUserMessageMobile);
}

function enableInvalidUserMessageMobile(){
	var invalidUserMessageMobile = document.getElementById('invalidUserMessageMobile');
	var invalidUserMessage = document.getElementById('invalidUserMessage');
	showElement(invalidUserMessageMobile);
	hideElement(invalidUserMessage);
}

function showInvalidUserMessage(){
	if(isMobile())
		enableInvalidUserMessageMobile();
	else
		enableInvalidUserMessage();
}

function inputValueChanged(id) {
	var value = gel(id).value;
	if(value.length == 0)
		disableSelectButton();
	else
		enableSelectButton();
	setModalParentHeight(true);
}

function showSelection(elem) {
	clearInputEntries();
	disableSelectButton();
	function toggleDisplay(group, user, mobile, email) {
		group = group ? 'block': 'none';
		user = user? 'block': 'none';
		mobile = mobile? 'block': 'none';
		email = email? 'block': 'none';
		var groupEl = document.getElementById('group');
		var userEl = document.getElementById('user');
		var mobileEl = document.getElementById('mobile');
		var emailEl = document.getElementById('email');
		if(groupEl)
			groupEl.style.display = group;
		if(userEl)
			userEl.style.display = user;
		if(mobile)
			mobileEl.style.display = mobile;
		if(email)
			emailEl.style.display = email;
	}

	if(elem.value == 'group')
		toggleDisplay(true, false, false, false);
	else if(elem.value == 'user')
		toggleDisplay(false, true, false, false);
	else if(elem.value == 'mobile')
		toggleDisplay(false, false, true, false);
	else if(elem.value == 'email')
		toggleDisplay(false, false, false, true);
}

function setModalParentHeight(animate) {
	var newHeight = $j('#bottomMarker').offset().top;
	var $el = window.parent.$j('#notify_conference_dialog .modal-body');
	$el.stop();
	if (!animate) {
		$el.css({
			minHeight: newHeight
		});
		return;
	}
	$el.animate({
		minHeight: newHeight
	});
}

function showSelectedText() {
	if (this.selectedIndex > -1) {
		var text = this.options[this.selectedIndex].text;
		$j('#slush_selection').text(text);
		setModalParentHeight(true);
	}
}

// Called when the form loads
addLoadEvent(function() {
	var orderedNumbersAndProviders = [];
	if (numberAndProviderResponse && numberAndProviderResponse.orderedNumbersAndProviders)
		orderedNumbersAndProviders = numberAndProviderResponse.orderedNumbersAndProviders;

	CustomEvent.on('content_frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	CustomEvent.on('frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	if(!isNotifyUpgraded) {
		$j('#content').hide();
		$j('#upgrade_error_message').show();
		return;
	}

	// If no Telephony numbers, Service Providers exist
    if (!gInputData.isSMS && isNotifyConferenceConfiguredProperly === "false")
        showAlert(callMessages["Notify is not properly configured. Please contact your system administrator."], 'error');

	// Similar check for SMS
	if (gInputData.isSMS && orderedNumbersAndProviders.length === 0)
		showAlert(callMessages["Notify is not properly configured. Please contact your system administrator."], 'error');

	NotifyOnTaskClient.updateServiceProviderDetails(serviceProviderDetails);
	var $el = window.parent.$j('#notify_conference_dialog .modal-body');
	if (isSmsModal === "true") {
		textCounter("", smsMaxLength);
	}
	else {
		if (isNoConference === "false") {
			$el.css({minHeight: 540});
			var messageField = gel('textMessage');
			messageField.value = optionalMessage;
			textCounter(messageField.value, 160);
		}
		else {
			$el.css({minHeight: 600});
			textCounter("", 160);
		}
	}
	if(!isMobile())
		$j('#item_selector').select2({minimumResultsForSearch: -1});
	
	
	orderedNumbersAndProviders.forEach(function(sp) {
		if(sp.type === 'number')
			spCount++;
	});

	
	if(!gInputData.isSMS)
		spCount = orderedNumbersAndProviders.length;

	if (isNoConference === "true" && spCount === 0) {
		var startCallBtn = $j('#ok_button');
		startCallBtn.addClass('disabled');
		startCallBtn.attr('disabled', 'disabled');
		showAlert(callMessages["Notify is not properly configured. Please contact your system administrator."], 'error');
	}
	var $spSelector = $j('#serviceProviderSelector');
	$spSelector.select2({
		width: '100%',
		minimumResultsForSearch: (spCount == 1 || isMobile()) ? -1: 2
	}).prop('disabled', spCount == 1);
	

	orderedNumbersAndProviders.forEach(function(item) {
		if (item.type === 'number') {
			spMap[item.number] = {
				serviceProvider: TELEPHONY_PROVIDER,
				number: item.number,
				sysId: item.sysId
			};
			var newOption = new Option(item.name, item.number, false, item.defaultFlag);
			$spSelector.append(newOption);
		} else if (item.type === 'confProvider' && !gInputData.isSMS) {
			if (item.name == TELEPHONY_PROVIDER)
				return;
			spMap[item.name] = {
				serviceProvider: item.name,
				number: '',
				sysId: ''
			};
			var newOption = new Option(item.name, item.name, false, false);
			$spSelector.append(newOption);
		}
	});

	$spSelector.trigger('change');
	if(document.body.addClassName)
		document.body.addClassName('wb');
	var ESC = 27;

	setModalParentHeight();

	if (numberAndProviderResponse && numberAndProviderResponse.errors && numberAndProviderResponse.errors.length > 0) {
			for (var i=0; i < numberAndProviderResponse.errors.length; i++) 
				showAlert(numberAndProviderResponse.errors[i], 'error');
	}

	
	$j(".outputmsg_div #output_messages #close-messages-btn").on("click", function() {
		setModalParentHeight(true);
	});
	document.addEventListener('blur', function(e) {
		if(!window.g_active_ac)
			return;
		setTimeout(function() {
			setModalParentHeight();
		}, 16);
	}, true);

	document.addEventListener('keydown', function(e) {
		if(e.keyCode == ESC) {
			if(window.g_active_ac || $j('.select2-drop:visible').length > 0) {
				setTimeout(function() {
					setModalParentHeight(true);
				}, 16);
			}
			else {
				window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {cmd: 'cancel', data:[]});
			}
		}
			
	}, true);
	var userI = gel("sys_display.ref_sys_users");
	userI.setAttribute("aria-label", new GwtMessage().getMessage("Add user"));
	var groupI = gel("sys_display.ref_sys_groups");
	if (groupI)
		groupI.setAttribute("aria-label", new GwtMessage().getMessage("Add group"));
	var dlg = GlideModal.prototype.get(uiPage);
	// clear the slush bucket
	slush.clear();
	slush.ignoreDuplicates = true;

	$j('#slush_left').on('change', showSelectedText);
	$j('#slush_right').on('change', showSelectedText);

	// show loading dialog until we get a response from our
	// ajax call to retrieve a participant list
	showLoadingIcon();
	showInvalidUserMessage();
	// get plan contacts via Ajax
	var ga = new GlideAjax(gInputData.siProcessor);
	ga.addParam('sysparm_name', 'getRecommendedParticipants');
	ga.addParam('sysparm_data', JSON.stringify(gInputData));
	ga.getXMLAnswer(loadResponse); //Ajax response callback function
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

function changeOptionsColor(options, isPhoneNumberRequired) {
	for(var i = 0; i < options.length; i++) {
		var itemId = options[i].value;
		var item = idMap[itemId];
		if(!item)
			continue;
		if(isPhoneNumberRequired) {
			options[i].removeClassName(item.phoneNumber.length === 0 ? invalidParticipants: validParticipants);
			options[i].addClassName(item.phoneNumber.length === 0 ? invalidParticipants: validParticipants);
		}else {
			options[i].removeClassName(item.phoneNumber.length === 0 ? invalidParticipants: validParticipants);
			options[i].addClassName(item.email.length === 0 ? invalidParticipants: validParticipants);
	
		}
				
	}
}

function onServiceProviderChanged(value) {
	if(!value)
		return;
	currentConfSPName = spMap[value].serviceProvider;
	// Specific handling until all providers support Title
	var $confSelector = $j('#conferenceTitle');
	var caps = NotifyOnTaskClient.getCapabilityMap()[currentConfSPName];
	if (caps && caps.title)
		$confSelector.prop('disabled', false);
	else
		$confSelector.prop('disabled', true);

    var el = gel('conferenceTitle');
    if (el)
        el.value = conferenceTitle;

    var isPhoneNumberRequired = false;
    var noteMessageTelephony = document.getElementById("noteMessageTelephony");
    var noteMessageConference = document.getElementById("noteMessageConference");

    if (spMap[value].serviceProvider === TELEPHONY_PROVIDER) {
        isPhoneNumberRequired = true;
        if (noteMessageTelephony)
            noteMessageTelephony.style.display = "block";
        if (noteMessageConference)
            noteMessageConference.style.display = "none";
    } else {
        isPhoneNumberRequired = false;
        if (noteMessageTelephony)
            noteMessageTelephony.style.display = "none";
        if (noteMessageConference)
            noteMessageConference.style.display = "block";
    }

    changeOptionsColor(slush.getLeftSelect().options, isPhoneNumberRequired);
    changeOptionsColor(slush.getRightSelect().options, isPhoneNumberRequired);
}

function addOption(item, className, side) {
	className = className || invalidParticipants;
	side = side || 'left';
	var itemName;
	if(currentConfSPName === TELEPHONY_PROVIDER) {
		if(typeof item.phoneNumber === 'string' && item.phoneNumber.length > 0)
			className = validParticipants;
	} else {
		if(typeof item.email === 'string' && item.email.length > 0)
			className = validParticipants;
	}
	
	if(className === invalidParticipants && isMobile()){
		itemName = formatMessage(callMessages["* {0}"], item.name);
	}else{
		itemName = item.name;
	}

	if (side == 'left') {
		slush.addLeftChoice(item.id, itemName);
		slush.getLeftSelect().options[slush.getLeftSelect().options.length - 1].addClassName(className);
	} else {
		var leftIndex = slush.getValues(slush.getLeftSelect()).indexOf(item.id) ;
		if(leftIndex == -1)
			slush.addRightChoice(item.id, itemName);
		else {
			slush.getLeftSelect().options.selectedIndex = leftIndex;
			slush.moveLeftToRight();
			}
		slush.getRightSelect().options[slush.getRightSelect().options.length - 1].addClassName(className);
	}
}

// Called when we get a response from the 'addLoadEvent' function
function loadResponse(response, isSelected) {
	hideLoadingIcon();
	if(typeof response == 'string') {
		if(response.length == 0)
			return;
		var result = JSON.parse(response);
		addToAvailableList(result);
		for(var i = 0; i < result.length;i++) {
			var side = isSelected?'right': 'left';
			var item = result[i];
			if(Array.isArray(item.users)) {
				if(item.showGroupName) {
// 					for(var j = 0; j < item.users.length && color == 'black'; j++) {
// 						if(!!item.users[j].phoneNumber && item.users[j].phoneNumber.length == 0)
// 							color = 'tomato';
// 					}
					addOption(result[i], invalidParticipants, side);
				}else {
					for(var j =0; j < item.users.length; j++) {
						if(item.users[j].id == g_user.userID) {
							addOption(item.users[j], invalidParticipants, 'right');
						} else {
							addOption(item.users[j], invalidParticipants, side);
						}
					}
				}
			}else {
				if(item.id == g_user.userID) {
					if(gInputData.isSMS)
						continue;
					side = 'right';
				}
				addOption(item, invalidParticipants, side);
			}
		}
		
	}
	// get and save the selected values on the right of the slush bucket
	var array = slush.getValues(slush.getRightSelect());
	var r = array.join(",");
	slush.saveRightValues(r);
	setModalParentHeight();
}

function continueOK() {
	if (isNoConference === "true" && spCount === 0)
		return;
	showLoadingIcon();
	if (gInputData.isSMS)
		message = gel('textSms').value;
	else
		message = gel('textMessage').value;
	var selectedEntities = slush.getValues(slush.getRightSelect());
	var el = gel('serviceProviderSelector');
	var slectedSPInfo = '';
	var selectedProvider = '';
	if(el) {
		slectedSPInfo = spMap[el.value];
		selectedProvider = slectedSPInfo.serviceProvider;
		fromNumber = slectedSPInfo.number;
	}
	
	el = gel('conferenceTitle');
	if (el && el.value) {
		gInputData.conferenceTitle = el.value;
	}
	else {
		if (!gInputData.isSMS && isNoConference == "true"){
			hideLoadingIcon();
			showAlert(callMessages["Please provide a title to start the meeting."], 'error');
			return;
		}
	}
	
	var validSelection = true;
	var finalItems = [];
	for(var i = 0; i < selectedEntities.length; i++) {
		var entry = selectedEntities[i];
		if(groupMap[entry]) {
			finalItems.push(groupMap[entry]);
			continue;
		}
		var item = idMap[entry];
		item.phoneNumber = item.phoneNumber || '';
		item.email = item.email || '';
		if(item.phoneNumber.length === 0 && (item.email.length === 0 || fromNumber)) {
			validSelection = false;
			continue;
		}
		finalItems.push(item);
	}

	if (!validSelection || finalItems.length == 0) {
		if(finalItems.length == 0) {
			hideLoadingIcon();
			// show after displaying loading icon.
			showAlert(callMessages["Invalid choice of participants"], 'error');
			return;
		}
	}
	var dlg = GlideModal.prototype.get(uiPage);
	var ga = new GlideAjax(gInputData.siProcessor);
	gInputData.items = finalItems;
	gInputData.fromNumber = fromNumber;
	
	if(!gInputData.isSMS)
		gInputData.serviceProvider = selectedProvider || currentConfSPName;
	gInputData.message = message;
	ga.addParam('sysparm_data', JSON.stringify(gInputData));
	if (gInputData.isSMS) {
		if(message.trim().length == 0) {
			hideLoadingIcon();
			showAlert(callMessages["No text message to send"], 'error');
			return;
		}
		ga.addParam('sysparm_name', 'sendSms');
		ga.getXMLAnswer(onConferenceModified);
		if(showOkToDismissMessage) {
			hideLoadingIcon();
			var startCallBtn = $j('#ok_button'); 
			if(startCallBtn) {
				startCallBtn.addClass('disabled');
			}
			showAlert(callMessages['Your request has been submitted. You can close the dialog and resume your work or wait here to check for any errors.']);
		}
	} else {
		if (!gInputData.confId)
			NotifyOnTaskClient.start(gInputData).then(function(result) {
				onConferenceModified(result);
			}, function(result) {
				onConferenceModified(result);
			});
		else {
			NotifyOnTaskClient.addParticipants(gInputData).then(function(result) {
				onConferenceModified(result);
			}, function(result) {
				onConferenceModified(result);
			});
		}
	}
	window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {cmd: 'submit', data: gInputData});
}
// callback function when new conference call is initiated
function onConferenceModified(result) {
	if(typeof result == 'string')
		result = JSON.parse(result);
	if (!result.status && result.errorMessages && result.errorMessages.length) {
		hideLoadingIcon();
		result.errorMessages.forEach(function (m) {
			m.split('\n').forEach(function (m) {
				showAlert(m, 'error');
			});
		});
	} else
		window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {cmd: 'ok', data: result});
	var startCallBtn = $j('#ok_button'); 
	if(showOkToDismissMessage && startCallBtn && startCallBtn.hasClass('disabled')) {
		startCallBtn.removeClass('disabled');
	}
}

// Called when the 'Cancel' button gets clicked
function continueCancel() {
	window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {cmd: 'cancel', data: []});
}
function isSelected(item) {
	var selectedEntries = slush.getValues(slush.getRightSelect());
	return selectedEntries.indexOf(item.id || item) != -1;
}

function clearInputEntries() {
	disableSelectButton();
	var phoneEl = gel("notifynow_participant.phone_number");
	if(phoneEl)
		phoneEl.value = '';
	var userEl = gel("ref_sys_users");
	if(userEl)
		userEl.value = '';
	var userDisplayEl = gel("sys_display.ref_sys_users");
	if(userDisplayEl)
		userDisplayEl.value = '';
	var groupEl = gel("ref_sys_groups");
	if(groupEl)
		groupEl.value = '';
	var groupDisplayEl = gel("sys_display.ref_sys_groups");
	if(groupDisplayEl)
		groupDisplayEl.value = '';
	var emailEl = gel('notifynow_participant.email');
	if(emailEl)
		emailEl.value = '';
	
}

function showAlert(msg, type) {
	if(!msg)
		return;
	type = type || 'info';
	g_GlideUI.addOutputMessage({msg: msg, type: type});
	setModalParentHeight(true);
}

function showFormattedMessageFromID(id, value) {
	if(!id)
		return;
var name = idMap[id].name;
	if(idMap[id].active) {
		if(name != value && (name.length > 0 && value.length > 0))
			showAlert(formatMessage(callMessages["{0} - {1} is already in the conference call"], value, name));
		else
			showAlert(formatMessage(callMessages["{0} is already in the conference call"], value));
		} else {
			if(name == value)
				showAlert(formatMessage('{0} is already selected', name));
			else
				showAlert(formatMessage('{0} - {1} is already selected', value, name));
		}
}

// Add a User or number to selected side of slush bucket
function addToSelected() {
	if($j('#add_to_selected').hasClass('disabled'))
		return;
	var phoneNumber = gel("notifynow_participant.phone_number").value;
	var userSysId = gel("ref_sys_users").value;
	var groupSysId = gel("ref_sys_groups") ? gel("ref_sys_groups").value : '';
	var emailId = gel("notifynow_participant.email").value;
	if( !(phoneNumber || userSysId || groupSysId || emailId)) {
		var selectEl = document.getElementById('item_selector');
		var selectedVal = selectEl.value;
		if(selectedVal == 'user')
			showAlert(callMessages["Please fill valid user"]);
		else if(selectedVal == 'group')
			showAlert(callMessages["Please fill valid group"]);
		else if(selectedVal == 'mobile')
			showAlert(callMessages["Please fill valid phone number"]);
		else if(selectedVal =='email')
			showAlert(callMessages["Please fill valid email"]);
		return;
	}
	var selectedEntries = slush.getValues(slush.getRightSelect());
	if(phoneNumber.length != 0 || userSysId.length != 0 || emailId.length != 0) {
		var id = phoneNumber || userSysId || emailId;
		if(idMap[id]) {
			clearInputEntries();
			if(!isSelected(id) && !idMap[id].active) {
				addOption(idMap[id], undefined, 'right');
				return;
			}
			if(phoneNumber.length != 0)
				showFormattedMessageFromID(id, phoneNumber);
			else if(emailId.length != 0)
				showFormattedMessageFromID(id, emailId);
			else if(userSysId.length != 0)
				showFormattedMessageFromID(id, idMap[id].name);
			return;
		}
	}
	// Case : If group already added - need to update member and/or shuffle left to right
	if(groupSysId.length != 0 && !!groupMap[groupSysId]) {
		clearInputEntries();
		
		if(isSelected(groupSysId)) {
			showAlert(callMessages["Group you added has already been selected"]);
			return;
		}

		var groupItem = groupMap[groupSysId];
		if(groupItem.showGroupName) {
			addOption(groupItem, validParticipants, 'right'); 
			return;
		}
		
		if(groupItem.users.length > 0) {
			
			// Update new Group membership every time a group is added by overwriting old group in idMap - Added via DEF DEF0172965
			updateMemberGroup(groupItem);
			
			var itemsAdded = 0;
			var itemsUpdated = 0;
			for(var j = 0; j < groupItem.users.length; j++) {
				if(selectedEntries.indexOf(groupItem.users[j].id) != -1) {
					// If user already on right, update Name (group membership) of user from idMap if updated in idMap
					if(updateSlushbucket(groupItem.users[j]))
						itemsUpdated++;  
					continue;
				}
				itemsAdded++;
				addOption(groupItem.users[j], undefined, 'right');
				// Update Name(group membership) if updated in idMap for entries in left of slushbucket
				if(updateSlushbucket(groupItem.users[j]))
					itemsUpdated++;
			}
			// Only if there was NO update or 'left to right' movement show message 
			if(itemsAdded == 0 && itemsUpdated == 0) {
				showAlert(callMessages["Group you added has already been selected"]);
			}
			return;
		}
		
		showAlert(callMessages["There are no members for the group you selected for this time"]);
		return;
	}
	var dlg = GlideModal.prototype.get(uiPage);
	var ga = new GlideAjax(gInputData.siProcessor);

	// validate the user/number/group and add to the right side
	ga.addParam("sysparm_name", 'validateAndGetParticipants');
	var data = {
		table: gInputData.table,
		sysId: gInputData.sysId,
		userId: userSysId,
		email: emailId,
		groupId: groupSysId,
		confId: gInputData.confId,
		phoneNumber: phoneNumber,
		isSMS: isSmsModal === 'true'
	};
	ga.addParam("sysparm_data", JSON.stringify(data));
	ga.getXMLAnswer(function(r) {
		if(r.length == 0)
			return;
		var result = JSON.parse(r);
		var item = result.length > 0 ? result[0]: undefined;
		if(phoneNumber.length != 0) {
			if(!item.isValidNumber) {
				showAlert(callMessages["Given phone number is not valid"], 'error');
				return;
			}
			clearInputEntries();
			if(item.active) {
				idMap[item.id] = item;
				showFormattedMessageFromID(item.id, phoneNumber);
				return;
			}
			if(isSelected(item.id)) {
				showFormattedMessageFromID(item.id, phoneNumber);
				return;
			}
			addToAvailableList(result);
			addOption(item, undefined, 'right');
			return;
		}
		if(userSysId.length != 0) {
			clearInputEntries();
			addToAvailableList(result);
			if(isSelected(item.id)) {
				showAlert(formatMessage(callMessages["{0} is already selected"], item.name));
				return;
			}
			if(item.active) {
				showAlert(formatMessage(callMessages["{0} is already in the conference call"], idMap[id].name));
				return;
			}
			addOption(item, undefined, 'right');
			return;
		}
		if(emailId.length != 0) {
			if(!item.isValidEmail) {
				showAlert(callMessages["Given email id is not valid"], 'error');
				return;
			}
			clearInputEntries();
			if(isSelected(item.id)) {
				showFormattedMessageFromID(item.id, item.email);
				return;
			}
			if(item.active) {
				idMap[item.id] = item;
				showFormattedMessageFromID(item.id, item.email);
				return;
			}
			
			addToAvailableList(result);
			addOption(item, undefined, 'right');
			return;
		}

		if(groupSysId.length == 0)
			return;
		clearInputEntries();
		if(result.length == 0 || (result.length > 0 && (result[0].users.length == 0 && (!result[0].embeddedGroups || result[0].embeddedGroups.length==0)))) {
			if (item && item.message)
				showAlert(item.message.messageText, item.message.messageType);
			else 
				showAlert(callMessages["There are no members for the group you selected for this time"]);
			return;
		}

		addToAvailableList(result);
		if(item.users && item.users.length > 0) {
			if(item.showGroupName) {
				if(!isSelected(item.id))
					addOption(item, validParticipants, 'right');
			}
			else {
				for(var j = 0; j < item.users.length; j++) {
					if(!isSelected(item.users[j].id))
						addOption(item.users[j], undefined, 'right');
					updateSlushbucket(item.users[j]);
				}
			}
			if (item.message)
				showAlert(item.message.messageText, item.message.messageType);
		} else if(item.embeddedGroups){
			if(item.showGroupName) {
				if(!isSelected(item.id))
					addOption(item, validParticipants, 'right');
			}
		} else {
			showAlert(callMessages["There are no members for the group you selected for this time"]);
		}
	});
}

// Update slush bucket display for participant from idMap - Added DEF0172965
function updateSlushbucket(userItem) {
	var isUpdated = false;
	var slushItems = slush.getRightSelect();
	var itemIndex = slush.getValues(slushItems).indexOf(userItem.id);
	if(itemIndex !== -1) {
		// Only if Name has changed in idMap
		if(slushItems[itemIndex].text !== idMap[userItem.id].name) {
			slushItems[itemIndex].text = idMap[userItem.id].name;
			isUpdated = true;
		}
	}		
	return isUpdated;
}

// Updates data in idMap for the group data passed (to capture new Group data as per UI changes)  - Added DEF0172965
function updateMemberGroup(newGrp) {
	if(newGrp && newGrp.users) {
		for(var j = 0; j < newGrp.users.length; j++) {
			idMap[newGrp.users[j].id] = newGrp.users[j];
		}
	}
}

var countField = gel("counter");
function textCounter(txtFieldValue, maxlength) {
        countField.textContent = formatMessage(callMessages["{0} characters remaining of {1} characters"], [(maxlength - txtFieldValue.length), maxlength]);
}
