var g_tableName = document.getElementById("task_table_name").value;
var g_taskSysId = document.getElementById("task_sys_id").value;
var g_templateSysId;  // the template currently selected by User

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

$j('#template_select').on('change', function (e) {
    var valueSelected = this.value;
    var hrNoteTemplate = new GlideRecord("sn_templated_snip_note_template");
    hrNoteTemplate.addQuery("name", valueSelected);
    hrNoteTemplate.query();
    var originalTempContent;
    
    if (hrNoteTemplate.next()) {
        originalTempContent = hrNoteTemplate.html_script_body;
        g_templateSysId = hrNoteTemplate.sys_id;
        var gaNoteTemplate = new GlideAjax("NoteTemplate");
        gaNoteTemplate.addParam('sysparm_name', 'ajaxSetTemplateVariables');
        gaNoteTemplate.addParam('sysparm_template', originalTempContent);
        gaNoteTemplate.addParam('sysparm_table_name', g_tableName);
        gaNoteTemplate.addParam('sysparm_table_sys_id', g_taskSysId);
        gaNoteTemplate.getXML(setTemplateVariables);              
    } else {
        $j("#selected_template").html("");
		g_templateSysId = null; //If user doesnot select a template, reset to null
	}    
});
    
function setTemplateVariables(response) {
    var templateContent = response.responseXML.documentElement.getAttribute("answer");
    $j("#selected_template").html(templateContent);
} 

function saveToM2MMLTable() {
    if (!g_templateSysId)
        return;
	
	var gaNoteTemplate = new GlideAjax('NoteTemplate');
	gaNoteTemplate.addParam('sysparm_name', 'saveToM2MMLTable');
	gaNoteTemplate.addParam('sysparm_task', g_taskSysId);
	gaNoteTemplate.addParam('sysparm_template', g_templateSysId);
	gaNoteTemplate.getXML();
}

function onSubmit() { 
	var templateElement = document.getElementById('selected_template');
	var doc = window.document, selection, range;
	
	//Apply selection to the text that user wants to copy to clipboard
	if (window.getSelection) {
	    selection = window.getSelection();
	    range = doc.createRange();
	    range.selectNodeContents(templateElement);
	    selection.removeAllRanges();
	    selection.addRange(range);
	} else if (doc.body.createTextRange) {
	    range = doc.body.createTextRange();
	    range.moveToElementText(templateElement);
	    range.select();
	}	
	
	// Execute copy command 
	try {
		document.execCommand('copy');
	} catch (err) {
		gs.log('Copy operation on message_template page failed:' + err);
	}
	
	var infoMsg = document.getElementById("infoMsg");
	infoMsg.style.display = "block";
	
	saveToM2MMLTable();
	
	setTimeout(function() { infoMsg.style.display = "none"; }, 2000);
}
