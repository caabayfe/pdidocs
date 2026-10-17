(function(global) {
	var workNotes = $("mim-promote-work-notes");
	var businessImpact = $("mim-promote-business-impact");
	var workNotesWrapper = $('work-notes-wrapper');
	var promoteBtn = $('mim-promote-button');
	var dialog, resizeObserver;
	if(config.workspace) {
		var modalTextAreas = document.querySelectorAll(".promote-modal-textarea");
		var iframeStyle = window.frameElement.style;
		var formContainer = $("mim-promote-form");
		resizeObserver = new ResizeObserver(function(entries) {
			iframeStyle.height = formContainer.offsetHeight + 5 + "px";
		});
		for(var i=0; i < modalTextAreas.length; i++) {
			resizeObserver.observe(modalTextAreas[i]);
		}
	} else {
		dialog = GlideModal.prototype.get("sn_major_inc_mgmt_mim_workbench_promote");
		var currentWorkNotes = dialog.getPreference('WORK_NOTES');
		if(currentWorkNotes) {
			workNotes.value = currentWorkNotes;
			workNotesOnChange();
		}
		var currentBusinessImpact = dialog.getPreference('BUSINESS_IMPACT');
		if(currentBusinessImpact)
			businessImpact.value = currentBusinessImpact;
	}
	function _debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this,
				args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	function workNotesOnChange() {
		if (!workNotes.value.trim()) {
			workNotesWrapper.removeClassName('is-filled');
			promoteBtn.addClassName('disabled');
			promoteBtn.writeAttribute('aria-disabled', true);
		} else {
			workNotesWrapper.addClassName('is-filled');
			promoteBtn.removeClassName('disabled');
			promoteBtn.writeAttribute('aria-disabled', false);
		}
	}

	function _promoteRestCall(record) {
		var dfd = $j.Deferred();
		var api = '/api/sn_major_inc_mgmt/mim/actions/' + window.NOW.MAJOR_INCIDENT_WORKBENCH.sys_id;
		var data = {
			action: 'PROMOTE',
			record: record
		};
		$j.ajax({
			type: 'POST',
			url: api,
			data: JSON.stringify(data),
			success: function(data) {
				dfd.resolve(data);
			},
			error: function() {
				dfd.reject();
			},
			contentType: "application/json",
			dataType: 'json'
		});
		return dfd.promise();
	}

	function promote() {
		getMessage("Promoted to a major incident", function(msg) {
			var updateWorkNotes = msg + "\n" + workNotes.value.trim();
			if (!promoteBtn.hasClassName('disabled')) {
				if (window.NOW.MAJOR_INCIDENT_WORKBENCH) {
					var record = {};
					record.work_notes = updateWorkNotes;
					record.business_impact = businessImpact.value;
					_promoteRestCall(record).then(function() {
						dialog.setPreference('reload', true);
						close();
					});
				} else {
					//When UI Page is rendered from Form UI Action
					if(config.workspace) {
						iframeMsgHelper.confirm({
							msg: msg,
							workNotes: workNotes.value.trim(),
							businessImpact: businessImpact.value.trim()
						});
					} else {
						g_form.getControl('work_notes').value = updateWorkNotes;
						if(currentBusinessImpact != businessImpact.value)
							g_form.setValue('business_impact', businessImpact.value);
						GlideModal.prototype.get('sn_major_inc_mgmt_mim_workbench_promote').destroy();
						gsftSubmit(null, g_form.getFormElement(), 'sysverb_mim_accept');
					}
				}
			}
		});
	}

	function close() {
		if(config.workspace) {
			resizeObserver.disconnect();
			window.location.href = window.location.href + '&sysparm_next_pg=true';
		} else {
			dialog.destroy();
		}
	}
	global.promoteModal = {
		promote: promote,
		close: close,
		workNotesOnChange: _debounce(workNotesOnChange, 200) // Only execute when left idle for 200 ms
	};
})(window);
