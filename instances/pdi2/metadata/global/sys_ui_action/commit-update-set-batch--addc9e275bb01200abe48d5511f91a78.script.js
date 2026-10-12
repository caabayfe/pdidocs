var commitInProgress = false;

function commit() {
	if (commitInProgress)
		return;

	// get remoteUpdateSetId from g_form if invoked on remote update set page
	var rusId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;

	var ajaxHelper = new GlideAjax('com.glide.update.UpdateSetCommitAjaxProcessor');
	ajaxHelper.addParam('sysparm_type', 'validateCommitRemoteUpdateSet');
	ajaxHelper.addParam('sysparm_remote_updateset_sys_id', rusId);
	ajaxHelper.getXMLAnswer(getValidateCommitUpdateSetResponse);
}

function getValidateCommitUpdateSetResponse(answer) {
	try {
		if (answer == null) {
			console.log('validateCommitRemoteUpdateSet answer was null');
			return;
		}
		console.log('validateCommitRemoteUpdateSet answer was ' + answer);
		var returnedInfo = answer.split(';');

		var sysId = returnedInfo[0];
		var encodedQuery = returnedInfo[1];
		var delObjList = returnedInfo[2];

		if (delObjList !== "NONE") {
			console.log('showing data loss confirm dialog');
			showDataLossConfirmDialog(sysId, delObjList, encodedQuery);
		}
		else {
			console.log('skipping data loss confirm dialog');
			var ga = new GlideAjax('UpdateSetCommitAjax');
			ga.addParam('sysparm_type', 'shouldShowConfirmAppInstall');
			ga.addParam('sysparm_rus_sys_id', sysId);
			ga.addParam('sysparm_in_hierarchy', true);
			ga.getXMLWait();
			var showDialog = ga.getAnswer();
			if (showDialog == 'true') {
				var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
				var dialog = new dialogClass('commit_app_install_confirm');
				dialog.setTitle("Confirm app installs");
				dialog.setWidth(450);
				dialog.setPreference('onConfirm', runTheCommit);
				dialog.setPreference('rus_sys_id', sysId);
				dialog.setPreference('in_hierarchy', true);
				dialog.render();
			} else
				runTheCommit(sysId, false, false);
		}
	} catch (err) {

	}
}

var dataLossConfirmDialog;
function destroyDialog() {
	dataLossConfirmDialog.destroy();
}

function runTheCommit(sysId, skipAppInstalls, dontDisplayAgain) {
	console.log('running commit on ' + sysId);
	console.log('dontDisplayAgain = ' + dontDisplayAgain);
	if (dontDisplayAgain)
		disableConfirmAppInstallDialog();

	commitInProgress = true;
	var ajaxHelper = new GlideAjax('HierarchyUpdateSetCommitAjax');
	ajaxHelper.addParam('sysparm_ajax_processor_function', 'commit');
	ajaxHelper.addParam('sysparm_ajax_processor_sys_id', sysId);
	if (skipAppInstalls != null && (typeof skipAppInstalls !== 'undefined') && skipAppInstalls)
		ajaxHelper.addParam('sysparm_ajax_processor_skip_app_installs', true);
	else
		ajaxHelper.addParam('sysparm_ajax_processor_skip_app_installs', false);

	ajaxHelper.getXMLAnswer(commitRemoteBaseUpdateSet);
}

function disableConfirmAppInstallDialog() {
	var ga = new GlideAjax('UpdateSetCommitAjax');
	ga.addParam('sysparm_type', 'setShowConfirmAppInstallPreference');
	ga.addParam('sysparm_show_confirm_app_install', 'false');
	ga.getXMLWait();
}

function showDataLossConfirmDialog(sysId, delObjList, encodedQuery) {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('update_set_data_loss_commit_confirm');
	dataLossConfirmDialog = dlg;
    dlg.setTitle('Confirm Data Destruction');
    if(delObjList == null) {
        dlg.setWidth(300);
    } else {
        dlg.setWidth(450);
    }

    dlg.setPreference('sysparm_sys_id', sysId);
	dlg.setPreference('sysparm_encodedQuery', encodedQuery);
    dlg.setPreference('sysparm_del_obj_list', delObjList);
	console.log('rendering data loss confirm dialog');
    dlg.render();
}


function commitRemoteBaseUpdateSet(answer) {
	if (answer == null)
		return;

	var workerId = answer;

	var map = new GwtMessage().getMessages(["Close", "Commit Update Set Batch", "Cancel", "Are you sure you want to cancel this update set commit?", "Go to Subscription Management"]);
	var sysId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");

	dd.setTitle(map["Commit Update Set Batch"]);
	dd.setPreference('sysparm_renderer_execution_id', workerId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); //collapsed root node by default
	dd.setPreference('sysparm_renderer_hide_drill_down', true);
	dd.setPreference('sysparm_button_subscription', map["Go to Subscription Management"]);
	dd.setPreference('sysparm_button_close', map["Close"]);


	dd.on("executionComplete", function(trackerObj) {

		var subBtn = $("sysparm_button_subscription");
		var tableCount = 0;
		if (trackerObj.result && trackerObj.result.custom_table_count)
			tableCount = Number(trackerObj.result.custom_table_count);

		if (tableCount > 0) {
				if (subBtn) {
							  subBtn.enable();
							  subBtn.onclick = function() {
								  window.open(trackerObj.result.inventory_uri);
							  };
						 }
				} else {
					subBtn.hide();
				}

		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});

	dd.on("bodyrendered", function(trackerObj) {
			var buttonsPanel = $("buttonsPanel");
			var table = new Element("table", {cellpadding: 0, cellspacing: 0, width : "100%"});
			buttonsCell = table.appendChild(new Element("tr")).appendChild(new Element("td"));
			buttonsCell.align = "right";
			buttonsPanel.appendChild(table);

			var closeBtn = $("sysparm_button_close");
			if (closeBtn)
				closeBtn.disable();

			var cancelBtn = new Element("button");
			cancelBtn.id = "sysparm_button_cancel";
			cancelBtn.type = "button";
			cancelBtn.innerHTML = map["Cancel"];
			cancelBtn.onclick = function() {
				var response = confirm(map["Are you sure you want to cancel this update set commit?"]);
				if (response != true)
					return;

				var ajaxHelper = new GlideAjax('HierarchyUpdateSetCommitAjax');
				ajaxHelper.addParam('sysparm_ajax_processor_function', 'cancel');
				ajaxHelper.addParam('sysparm_worker_id', workerId);
				ajaxHelper.getXMLAnswer(getCancelRemoteUpdateSetResponse);
			};
			buttonsCell.appendChild(cancelBtn);
		});

	dd.on("beforeclose", function() {
		reloadWindow(window);
	});

	dd.render();
}

function getCancelRemoteUpdateSetResponse(answer) {
	if (answer == null)
		return;

	// Nothing really to do here.
}
