var $rejectBtn = $('mim_rejection_reason_ok_btn');
$rejectBtn.textContent = getMessage('Reject'); // TODO: this code to be removed, modal window to be re-written in plain html/js to make it consistant with promote and reject
var worknoteTextarea = $('mim_rejection_reason_text');
worknoteTextarea.writeAttribute('aria-required', 'true');
var rejectionReason = $("mim_rejection_reason_text");
function rejectionReasonOnChange() {
	if(!rejectionReason.value.trim()) {
		$rejectBtn.writeAttribute('aria-disabled', true);
	} else {
		$rejectBtn.writeAttribute('aria-disabled', false);
	}
}
rejectionReason.addEventListener('keyup', function(){
	rejectionReasonOnChange();
});
function updateWorknotes() {
	if(rejectionReason && rejectionReason.value) {
                getMessage("Major incident candidate rejected", function (msg) {
			var workNotes = msg + "\n" + rejectionReason.value.trim();
			if(window.NOW.MAJOR_INCIDENT_WORKBENCH){
				var record = {};
				record.work_notes = workNotes;
				rejectRestCall(record).then(function(){
					var modal = GlideModal.prototype.get("sn_major_inc_mgmt_mim_rejection_reason");
					modal.setPreference('reload', true);
					modal.destroy();
				});
			} else {
				//To be refactored after PRB1240294 is fixed
				g_form.getControl('work_notes').value = workNotes;
				//destroying the GlideModal rendered in UI Action 'sysverb_mim_reject'
				GlideModal.prototype.get('sn_major_inc_mgmt_mim_rejection_reason').destroy();
				//calling the UI action 'sysverb_mim_reject' to run rejectMICOnConfirmation()
				gsftSubmit(null, g_form.getFormElement(), 'sysverb_mim_reject');
			}
		});
	}
}
if(window.NOW.MAJOR_INCIDENT_WORKBENCH){
	function rejectRestCall(record){
		var dfd = $j.Deferred();
		var api = '/api/sn_major_inc_mgmt/mim/actions/' + window.NOW.MAJOR_INCIDENT_WORKBENCH.sys_id;
		var data = {
			action: 'REJECT',
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
	$j('#cancel_button').attr('onclick', '').on('click', function(){
		GlideModal.prototype.get("sn_major_inc_mgmt_mim_rejection_reason").destroy();
	});
	rejectionReasonOnChange();
} else
	//IIFE to populate textarea with current worknote and hide tooltips on modal closure.
	(function () {
		var notes = g_form.getValue("work_notes");
		if(notes != '') {
			$("mim_rejection_reason_text").value = notes;
			enableButton();
		}
		rejectionReasonOnChange();
		GlideModal.prototype.get('sn_major_inc_mgmt_mim_rejection_reason').on('beforeclose', function() {
			$j('.tooltip').hide().tooltip('hide');
		});
	})();
