$("templateOK").disable();

// enable ok button when template name is not empty
Event.observe('template_name', 'change', function (event) {
   if ($('template_name').value != '') {
      $("templateOK").enable();
   }
   else {
      $("templateOK").disable();
   }
});

function saveChecklistAsTemplate() {
	// disable the buttons on popup
	$("templateOK").disable();
	$("templateCancel").disable();

	var template_name = gel('template_name').value;
	var checklist_id = gel('checklist_id').value;
	var retStatus = false;

	if (template_name != '') {
		var data = Object.toJSON({"name":template_name, "checklistId":checklist_id});
		new Ajax.Request('/api/now/checklist/templates', {
			asynchronous: false,
			requestHeaders: {"X-UserToken": window.g_ck},
			contentType : 'application/json;charset=UTF-8',
			parameters : data,
			onSuccess: function(response) {
				retStatus = true;
			},
			onFailure: function() {
				console.log('Something went wrong with saving the checklist as template...');
				retStatus = false;
			}
		});
	}
	if (retStatus) {
		if (GlideDialogWindow.get())
			GlideDialogWindow.get().fireEvent('save_template_success');
	}
	return retStatus;
}

function cancelDialog() {
	GlideDialogWindow.get().destroy();
}
