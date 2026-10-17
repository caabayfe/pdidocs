var NotifyOnTaskUIProcessor = function(dlgWindow) {
	var $availableUsers = null;
	var $btnCancelPopup = null;
	var $frmMimPopup = null;
	var $messageText = null;
	var $count = null;
	var $lstCustomUsers = null;
	var $pnlNotification = null;

	//Initialize the window
	_init(dlgWindow);

	function _init(dlgWindow) {
		var notifyParameters = _initParams(dlgWindow);
		_initFields();
		_initEventHandlers(notifyParameters);
		countCharacters();
	}

	function _initEventHandlers(notifyParameters) {
		$btnCancelPopup.click(function(e) {
			submitCancel(e, notifyParameters);
		});

		$frmMimPopup.submit(function(e) {
			onFormSubmit(e, this, notifyParameters);
		});

		$j(".checkbox").each(function(e) {
			$j(this).onclick = null;
			$j(this).click(function() {
				setCheckBox(this);
			});
		});

		var value = $availableUsers.val();
		var availableUsers = $j.parseJSON(value);

		$j('#users table tr td div span > input').each(function() {
			var name = this.id.replace("ni.", "");
			if (!availableUsers[name] && name != "other") {
				var $elem = $j(this);
				$elem.attr('disabled', true);
				var title = $j('#' + name + '_label').text();
				title = new GwtMessage().getMessage('"{0}" field is empty', title);
				$elem.next().attr('title', title);
			}
		});
	}

	function _initFields() {
		$availableUsers = $j('#available_users');
		$btnCancelPopup = $j("#cancel_popup");
		$frmMimPopup = $j("#mimSmsPopup");
		$messageText = $j('#message_text');
		$count = $j('#count');
		$lstCustomUsers = $j('#custom_users');
		$pnlNotification = $j("#pnlNotification");
	}

	function _initParams(dlgWindow) {
		var notifyParameters = {};
		notifyParameters.dlgWindow = dlgWindow;
		notifyParameters.sourceID = dlgWindow.getPreference("sys_id");
		notifyParameters.sourceTable = dlgWindow.getPreference("source_table");

		notifyParameters.showLoading = dlgWindow.getPreference("show_loading");
		notifyParameters.actionType = dlgWindow.getPreference("type");
		notifyParameters.addToWorkNotes = dlgWindow.getPreference("add_to_work_notes");

		//Callback Methods
		notifyParameters.submitCallback = dlgWindow.getPreference("submit_callback");
		notifyParameters.cancelCallback = dlgWindow.getPreference("cancel_callback");
		notifyParameters.errorCallback = dlgWindow.getPreference("error_callback");
		notifyParameters.successCallback = dlgWindow.getPreference("success_callback");

		notifyParameters.sPopup = $j("#submit_popup");
		return notifyParameters;
	}

	function submitCancel(e, notifyParameters) {
		e.preventDefault();
		clearNotifications();
		notifyParameters.cancelCallback(notifyParameters);
	}

	function onFormSubmit(e, formObj, notifyParameters) {
		e.preventDefault();

		if (notifyParameters.sPopup.hasClass("disabled"))
			return false;
		clearNotifications();
		var formParameters = $j(formObj).serializeObject();
		if (validateForm(formParameters)) {
			notifyParameters.sPopup.addClass("disabled");

			var processMethod = null;
			if (notifyParameters.showLoading === true)
				showLoadingDialog();
			if (notifyParameters.actionType == "sms") {
				processMethod = "sendSmsAjax";
			}else if (notifyParameters.actionType == "conference") {
				processMethod = "initConferenceCallAjax";
			}
			if (processMethod !== null) {
				processAjax(processMethod,notifyParameters, formObj,formParameters );
			}
		} else {
			showNotification("error", getMessage("Please select one or more users."));
		}
	}

	function validateForm(formData) {
		var fields = $j.parseJSON(formData.available_users);
		var hasSelection = false;
		for (var field in fields) {
			if (formData[field] !== null && formData[field] !== "" && formData[field] === "true") {
				if (fields.hasOwnProperty(field)) {
					hasSelection = true;
				}
			}
		}

		if (!hasSelection && formData.other === "true" && formData.custom_users !== "") {
			var customUserList = formData.custom_users.split(",");
			if (customUserList.length > 0)
				hasSelection = true;
		}
		return hasSelection;
	}

	function processAjax(processMethod, notifyParameters, formObj, formParameters) {
		GlideAjaxUtil.callJson("NotifyOnTaskAjaxProcessor", processMethod, {notify: {addToWorkNotes: notifyParameters.addToWorkNotes}, form: formParameters}, "data", function(data) {
			if (showLoading)
				hideLoadingDialog();
			notifyParameters.sPopup.removeClass("disabled");
			notifyParameters.successCallback(notifyParameters, formObj, formParameters, data);
		});
		notifyParameters.submitCallback(notifyParameters, formObj, formParameters);
	}

	function countCharacters() {
		$count.text($messageText.val().length + '/' + $messageText.attr('maxlength'));
	}

	function addUser() {
		var $userRefDisplay = $j('#display_hidden\\.user_ref');
		var $userRefDisplayVisible = $j('#sys_display\\.user_ref');
		var $userRef = $j('#user_ref');

		// check if this is a valid user
		if ($userRef.val().length) {
			// valid user reference, add user
			addUserCallback($userRef, $userRefDisplay, $userRefDisplayVisible);
		} else {
			// invalid user, check if it's a valid E.164 compliant phone number
			var args = {
				phone_number: $userRefDisplay.val()
			};
			GlideAjaxUtil.callJson("NotifyOnTaskAjaxProcessor", "isValidE164CompliantPhoneNumber", args, "data", function(isValid) {
				if (isValid === 'true') {
					// valid number, add number
					$userRefDisplay.removeClass('ref_invalid');
					$userRefDisplayVisible.removeClass('ref_invalid');
					$userRef = $userRefDisplay;

					// execute callback
					addUserCallback($userRef, $userRefDisplay, $userRefDisplayVisible);
				}
			});
		}
	}

	function addUserCallback($userRef, $userRefDisplay, $userRefDisplayVisible) {
		var $users = $lstCustomUsers;

		if ($users.val().indexOf($userRef.val()) > -1) {
			alert(getMessage("The selected user has already been added."));
			$userRefDisplay.val('');
			return;
		}

		var alink = '<a onclick="notifyUiProcessor.removeUser(this)">' + $userRefDisplay.val() + '</a>';
		var $checkbox = $j('#other_label');
		if ($users.val() === '')
			$checkbox.html(alink);
		else
			$checkbox.append(document.createTextNode(', ')).append(alink);


		if ($users.val().length) {
			$users[0].value += ',';
		}

		var $userNames = $j('#custom_user_names');
		if ($userNames.val().length > 0) {
			$userNames.val($userNames.val() + ',');
		}

		$users.val($users.val() + $userRef.val());
		$userNames.val($userNames.val() + $userRefDisplay.val());
		$userRefDisplay.val('');
		$userRefDisplayVisible.val('');
		$userRef.val('');
	}

	function removeUser(a) {
		var $userNames = $j('#custom_user_names');
		var $users = $j('#custom_users');

		var ids = $users.val().split(',');
		var names = $userNames.val().split(',');
		var index = names.indexOf($j(a).html());

		var $checkbox = $j('#other_label');
		if (names.length == 1) {
			$checkbox.html(getMessage('Other'));
			$users.val('');
			$userNames.val('');
			return;
		}
		names.splice(index, 1);
		ids.splice(index, 1);

		$checkbox.html('');
		for (var i = 0; i < names.length; i++) {
			$checkbox.append('<a onclick="notifyUiProcessor.removeUser(this)">' + names[i] + '</a>');
			if (i != names.length -1) {
				$checkbox.append(document.createTextNode(', '));
			}
		}

		$users.val(ids.toString());
		$userNames.val(names.toString());
	}

	function setCheckBox(input) {
		var availableUsers = $j.parseJSON($availableUsers.val());
		var user;

		var id = input.id;
		id = id.substring(id.indexOf('.') + 1);

		var isChecked = input.checked;
		$j('#' + id).val(isChecked);

		if (id !== 'other')
			user = availableUsers[id];

		if (isChecked) {
			if (id === 'other') {
				$j('#user_add').css('display', 'inline');
			} else if (typeof user !== 'undefined') {
				$j('#' + id + '_label').html(user.display_value);
			}
		} else {
			if (id === 'other') {
				clearUsers();
				$j('#user_add').css('display', 'none');
			} else if (typeof user !== 'undefined') {
				resetLabel(id, availableUsers[id].label);
			}
		}
	}

	function resetLabel(id, label) {
		var $label = $j('#' + id +'_label');
		$label.html(label);
	}

	function clearUsers () {
		$j('#other_label').html(getMessage('Other'));
		$j('#custom_users').val('');
		$j('#custom_user_names').val('');
		$j('#sys_display\\.user_ref').val('');
	}

	function showNotification(type, message) {
		var el = $j("#notifyAlert").clone();
		el.addClass("notification-" + type);
		el.find(".message").html(message);
		el.show();
		$pnlNotification.append(el);
	}

	function clearNotifications() {
		$pnlNotification.empty();
	}

	return {
		resetLabel: resetLabel,
		clearUsers: clearUsers,
		setCheckBox: setCheckBox,
		removeUser: removeUser,
		addUser: addUser,
		countCharacters: countCharacters

	};
};
