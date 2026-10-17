// Create a radio group of template list and insert into the DOM
var templateList = gel('template_list').value.evalJSON(true);
var record = gel('record').value;
var table = gel('table').value; 
var templateSelected = -1;

var html = '<fieldset>';
for (var i=0; i<templateList.length; i++) {
	html += '<div class="row form-group"><div class="input-group-radio">';
	html += '<input id="radio' + i +'" class="radio-label" type="radio" name="radio" value="'+ templateList[i].sysID + '">';
	html += '<label for="radio' + i + '" class="radio-label">' + templateList[i].name + '</label>';
	html += '</div></div>';
}
html += '</fieldset>';

$('templateList').insert(html);

$("tmpOK").disable();

// enable ok button when a template is selected
$$('.radio-label').each(function(ele) {
	ele.observe('click', function (event) {
		$("tmpOK").enable();
		var radioID;

		if (ele.tagName == "LABEL")
			radioID = ele.readAttribute('for');
		else if (ele.tagName == "INPUT")
			radioID = ele.readAttribute('id');
		
		if(radioID)
			templateSelected = $(radioID).value;
		else
			templateSelected = -1;
	});
});

function createChecklistFromTemplate() {
	// disable the buttons on popup
	$("tmpOK").disable();
	$("tmpCancel").disable();
	
	var retStatus = false;
	if (templateSelected != -1) {
		var data = Object.toJSON({"document":record, "table":table, "templateId":templateSelected});
		new Ajax.Request('/api/now/checklist', {
			asynchronous: false,
			requestHeaders: {"X-UserToken": window.g_ck},
			contentType : 'application/json;charset=UTF-8',
			parameters : data,
			onSuccess: function(response) {
				retStatus = true;
			},
			onFailure: function() { 
				console.log('Something went wrong with creating checklist from template...'); 
				retStatus = false;
			}
		});
	}
	if (retStatus) {
		if (GlideDialogWindow.get())
			GlideDialogWindow.get().fireEvent('template_success');
	}
	return retStatus;
}

function cancelTemplateDialog() {
	GlideDialogWindow.get().destroy();
}
