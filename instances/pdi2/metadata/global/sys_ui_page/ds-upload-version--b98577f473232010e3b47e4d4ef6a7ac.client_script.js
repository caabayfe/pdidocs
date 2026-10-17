var isActionFromWorkspace = gel('isActionFromWorkspace').value == 'true';

function processVersion() {
    var ft = gel('file_type');
    var ftv = ft.options[ft.selectedIndex].value;
	
    if (ftv == 'url' && validateVersionWithUrl()) {
        destroyWindow();
        return true;
    }
	
	var canWriteDoc = gel('canWriteDocument').value;
	if (canWriteDoc == 'false') {
		showErrorMessage("${gs.getMessage('Current User does not have enough permission to create version.')}");
		return false;
	}
	
	if (ftv == 'attachment' && validateVersionWithAttachment()) {
        // submit attachment form
		gel('ok_button').disabled = true;
		gel('cancel_button').disabled = true;
		var documentId = gel('documentId').value;
		var ga = new GlideAjax('DocumentObjectManager');
		ga.addParam('sysparm_name','insertVersion');
		ga.addParam('sysparm_document_type','attachment');
		ga.addParam('sysparm_document_sys_id',documentId);
		ga.addParam('sysparm_version_notes', notes_file.value);
		ga.getXMLWait();
		var createdSysId = ga.getAnswer();

		gel('temporary_ds_version_id').value = createdSysId;
		
		uploadFile();
		//gel('please_wait').style.display = 'block';
    }
	return false;
}

function validateVersionWithUrl() {
	var canWriteDoc = gel('canWriteDocument').value;
	if (canWriteDoc == 'false') {
		showErrorMessage("${gs.getMessage('Current User does not have enough permission to create version.')}");
		return false;
	}
    var t = gel('url').getValue();
    var invalidFields = new Array();
    var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (!regex.test(t))
        invalidFields.push("${gs.getMessage('Invalid URL format. Please enter valid URL.')}");
    var message = "";
    for (var i = 0; i < invalidFields.length; i++) {
        message += " - " + invalidFields[i] + "\n";
    }
    if (invalidFields.length > 0) {
        //alert("${gs.getMessage('Please correct the following')}:\n" + message);
		//showErrorMessage('The following mandatory fields are not filled in: ' + invalidFields.join(', '));
		showErrorMessage(invalidFields.join(', '));
        return false;
    }
    return true;
}

function closeMessages(element) {
    $j(element).siblings('span.outputmsg_text')[0].empty();
    $j(element).parent().hide();
    return false;
}

function hideErrorMessages() {
    $j("#errorAlert").hide();
}

function showErrorMessage(text) {
    $j('#errorAlert').show().find('span.outputmsg_text').text(text);
    return false;
}

function validateVersionWithAttachment() {
    var invalidFields = new Array();

    if (gel('file').getValue() == "") {
        invalidFields.push("${gs.getMessage('Choose a file for the version')}");
    }
    var message = "";
    for (var i = 0; i < invalidFields.length; i++) {
        message += " - " + invalidFields[i] + "\n";
    }
    if (invalidFields.length > 0) {
        //alert("${gs.getMessage('Please correct the following')}:\n" + message);	
		//showErrorMessage('The following mandatory fields are not filled in: ' + invalidFields.join(', '));
		showErrorMessage(invalidFields.join(', '));
        return false;
    }
    return true;
}

function uploadFile() {
	var attachmentForm = gel("sys_attachment");
	attachmentForm.submit();
}

function destroyWindow() {
	
	if(!isActionFromWorkspace) {
		GlideDialogWindow.get().destroy();
		return false;
	}
	
	if (event && event.target.id == 'cancel_button') {
		iframeMsgHelper.cancel({
			shouldReload: false
		});
	}
}

function displayFileType(event) {
    if (event.value == 'url') {
        gel('url_text_row').style.display = 'block';
        //gel('choose_file').style.display = 'none';
		gel('choose_file_row').style.display = 'none';
    } else {
        gel('url_text_row').style.display = 'none';
		gel('choose_file_row').style.display = 'block';
        //gel('choose_file').style.display = 'block';
    }
}

function disableOKButton() {
    $('ok_button').disabled = true;
}

function enableOKButton() {
    $('ok_button').disabled = false;
}
