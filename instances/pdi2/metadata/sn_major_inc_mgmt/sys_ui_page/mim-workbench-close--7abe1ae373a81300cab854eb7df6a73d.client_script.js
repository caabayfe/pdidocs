(function(global){
	var resolutionNotes = $("mim-resolution-notes");
	var resolutionNotesWrapper = $("resolution-notes-wrapper");
	var resolutionCode = $("mim-resolution-code");
	var resolutionCodeWrapper = $("resolution-code-wrapper");
	var closeBtn = $("mim-close-incident-button");
	var dialog = GlideModal.prototype.get("sn_major_inc_mgmt_mim_workbench_close");
	var closeCodes = dialog.getPreference('CLOSE_CODES');
	var currentCloseCode = dialog.getPreference('CURRENT_CLOSE_CODE');
	var currentCloseNotes = dialog.getPreference('CURRENT_CLOSE_NOTES');
	if (closeCodes)
		closeCodes.forEach(function(item){
			resolutionCode.insert(new Element('option', {value: item.value.value}).update(item.label.value));
		});
	if(currentCloseCode) {
		resolutionCode.value = currentCloseCode;
		resolutionCodeOnChange();
	}
	if(currentCloseNotes) {
		resolutionNotes.value = currentCloseNotes;
		resolutionNotesOnChange();
	}
	function _debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
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
	function enableCloseBtn(){
		if(resolutionNotes.value.trim() && resolutionCode.value) {
			closeBtn.removeClassName('disabled');
			closeBtn.writeAttribute('aria-disabled', false);
		} else {
			closeBtn.addClassName('disabled');
			closeBtn.writeAttribute('aria-disabled', true);
		}
	}
	function resolutionNotesOnChange() {
		if(!resolutionNotes.value.trim())
			resolutionNotesWrapper.removeClassName('is-filled');
		else
			resolutionNotesWrapper.addClassName('is-filled');
		enableCloseBtn();
	}
	function resolutionCodeOnChange() {
		if(!resolutionCode.value)
			resolutionCodeWrapper.removeClassName('is-filled');
		else
			resolutionCodeWrapper.addClassName('is-filled');
		enableCloseBtn();
	}
	function _closeRestCall(record){
		var dfd = $j.Deferred();
		var api = '/api/sn_major_inc_mgmt/mim/actions/' + window.NOW.MAJOR_INCIDENT_WORKBENCH.sys_id;
		var data = {
			action: 'CLOSE',
			record: record
		};
		$j.ajax({
			type: 'POST',
			url: api,
			data: JSON.stringify(data),
			success: function(data) { dfd.resolve(data);},
			error: function(){dfd.reject();},
			contentType: "application/json",
			dataType: 'json'
		});
		return dfd.promise();
	}
	function closeIncident(){
		if(!closeBtn.hasClassName('disabled')) {
			var record = {};
			record.close_notes = resolutionNotes.value.trim();
			record.close_code = resolutionCode.value;
			_closeRestCall(record).then(function(){
				dialog.setPreference('reload', true);
				closeModal();
			});
		}
	}
	function closeModal(){
		dialog.destroy();
	}
	global.closeIncidentModal = {
		closeIncident: closeIncident,
		cancel: closeModal,
		resolutionNotesOnChange: _debounce(resolutionNotesOnChange, 200), // Only execute when left idle for 200 ms
		resolutionCodeOnChange: resolutionCodeOnChange
	};
})(window);
