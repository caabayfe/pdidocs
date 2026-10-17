addLoadEvent(formOnLoad);
//method only for >=ie9 browsers.
function placeInfoMessagesBelowHeader() {
    if ($$("#output_messages").length == 2) {
        $$("#output_messages")[1].replace($$("#output_messages")[0]);
    }
}

function downloadTemplate() {
    var excelType = "xlsx";
    if(gel('excel_type')) {
        excelType = gel('excel_type').value; 
    }
    var tableName = gel('sysparm_target').value;
    var sysparm_rows = gel('sysparm_rows').value;
    var numRows = parseInt(sysparm_rows);
    var sysparm_query = gel('sysparm_query').value;
    var sysparm_view = gel('sysparm_view').value;
    var action = "import_insert_variable_template";
    var templateType = getTemplateType();
	var model_id = gel('sysparm_variable_model_id').value;
	var pollAction = "init";
	
    if (templateType == 'update') {
        action = "import_update_variable_template";
        if (numRows >= g_export_warn_threshold) {
			var updateString = postString(model_id, excelType, tableName, pollAction, action, sysparm_query, sysparm_rows, sysparm_view, "");
			makeRequest(updateString, this.ackInit.bind(this));
            return false;
        }
    }

	var insertString = postString(model_id, excelType, tableName, pollAction, action, sysparm_query, sysparm_rows, sysparm_view, "ALL_FIELDS");
	makeRequest(insertString, this.ackInit.bind(this));
    return false;
}

function postString(model_id, excelType, tableName, pollAction, action, sysparm_query, sysparm_rows, sysparm_view, sysparm_fields) {
	return "sysparm_model_id=" + model_id + "&sysparm_excel_type=" + excelType + "&sysparm_target=" + tableName + "&sys_action=" + pollAction + "&sysparm_export=" + action +
		"&sysparm_query=" + sysparm_query + "&sysparm_rows=" + sysparm_rows + "&sysparm_view=" + sysparm_view + "&sysparm_fields=" + sysparm_fields;
}


var jobId;
function makeRequest(postString, callback) {
	var ga = new GlideAjax('poll_processor', 'poll_processor.do');
	ga.setQueryString(postString);
	ga.getXML(callback);
}

function ackInit(response) {		    
	this.jobId = response.responseText;
	queuePoll();		
}

function queuePoll() {
	this.timerId = setTimeout(this.poll.bind(this), '1000');
}

function ack(response) {
	var answer = response.responseText;
	
	if (answer.indexOf('complete') == 0) {
		var splits = answer.split(',');
	    var id = splits[1];
    
		top.window.location = "sys_attachment.do?sys_id=" + id;
		
		if ($$("#download_template_button").length == 1) 
			$j("#download_template_button").removeAttr("disabled");

	    return;       
	 } 
	else if (answer.indexOf('error') == 0) {	    	
		var split = answer.split(',');
	    if (split.length > 1) 	    		
	    	var error = split[1]; 
		
		if ($$("#download_template_button").length == 1) 
			$j("#download_template_button").removeAttr("disabled");

		return;	
	} 
    else if (answer.indexOf('initial') != 0) {
	    queuePoll();
	}
  
}

function poll() {
	if (this.jobId) {
		var postString = "job_id=" + this.jobId +"&sys_action=poll";
		makeRequest(postString, this.ack.bind(this));
	}
}

// DEF0814994: staged upload so the modal stays open with a scan/import progress bar instead of reloading
// behind a toast. Flow: upload (kick off AV/PII scan) -> poll until the verdict settles -> import when clean.
var IMPORT_PROCESSOR = "sys_import_parameter_template.do";
var SCAN_POLL_MS = 1000;
var SCAN_MAX_POLLS = 120; // ~2 minutes before we give up and clean up
var scanHandle = null;    // { attId, holderId } while a scan/import is in flight
var scanPollTimer = null;
var scanPollCount = 0;

function upload() {
	var fileName = gel('attachFile').value;
	var dot = fileName.lastIndexOf('.') + 1;
	var suffix = fileName.substring(dot).toLowerCase();

	if (suffix != 'xlsx') {
		if (fileName.empty())
			alert(getMessage("Please select an Excel workbook (.xlsx) file to upload."));
		else
			alert(suffix + " is not a supported file format. Only .xlsx files can be uploaded.");
		return;
	}

	var glideUI = GlideUI.get();
	if (glideUI)
		glideUI.clearOutputMessages();

	setScanBusy(true);
	showScanStatus('progress', getMessage("Uploading and scanning") + "…");

	var fd = new FormData();
	fd.append("attachFile", gel("attachFile").files[0]);
	fd.append("sysparm_variable_model_id", gel("sysparm_variable_model_id").value);
	fd.append("sysparm_target", gel("sysparm_target").value);
	fd.append("sysparm_process_stage", "upload");

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200)
				onUploadDone((this.responseText || "").trim());
			else
				failScan(getMessage("Upload failed. Please try again."));
		}
	};
	xhr.open("POST", IMPORT_PROCESSOR);
	addUserToken(xhr);
	xhr.send(fd);
}

function onUploadDone(resp) {
	if (resp.indexOf('ok,') === 0) {
		var p = resp.split(',');
		scanHandle = { attId: p[1], holderId: p[2] };
		scanPollCount = 0;
		showScanStatus('progress', getMessage("Scanning for viruses") + "…");
		queueScanPoll();
	} else {
		failScan(stripError(resp));
	}
}

function queueScanPoll() {
	scanPollTimer = setTimeout(scanPoll, SCAN_POLL_MS);
}

function scanPoll() {
	if (!scanHandle)
		return;
	if (++scanPollCount > SCAN_MAX_POLLS) {
		cancelScan();
		failScan(getMessage("The security scan is taking longer than expected. Please try again later."));
		return;
	}
	stageRequest('poll', onScanPoll);
}

function onScanPoll(resp) {
	if (resp === 'available') {
		showScanStatus('progress', getMessage("Importing") + "…");
		stageRequest('import', onImportDone);
	} else if (resp === 'pending') {
		queueScanPoll();
	} else if (resp === 'infected') {
		scanHandle = null; // the server already cleaned up the rejected upload
		failScan(getMessage("The file did not pass the security scan and was rejected."));
	} else {
		scanHandle = null;
		failScan(stripError(resp));
	}
}

function onImportDone(resp) {
	scanHandle = null; // the server cleaned up the attachment + holder after importing
	if (resp.indexOf('complete,') === 0) {
		var n = resp.split(',')[1];
		succeedScan(getMessage("Imported {0} test run data set(s).").replace('{0}', n));
	} else {
		failScan(stripError(resp));
	}
}

// POST a non-multipart stage (poll/import/cancel) to the processor, carrying the round-tripped handle.
function stageRequest(stage, onDone) {
	var params = "sysparm_process_stage=" + encodeURIComponent(stage) +
		"&sysparm_att_id=" + encodeURIComponent(scanHandle.attId) +
		"&sysparm_holder_id=" + encodeURIComponent(scanHandle.holderId) +
		"&sysparm_target=" + encodeURIComponent(gel('sysparm_target').value) +
		"&sysparm_variable_model_id=" + encodeURIComponent(gel('sysparm_variable_model_id').value);

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE)
			onDone(this.status == 200 ? (this.responseText || "").trim() : 'error,' + getMessage("Request failed."));
	};
	xhr.open("POST", IMPORT_PROCESSOR);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	addUserToken(xhr);
	xhr.send(params);
}

// Best-effort cleanup of the transient scan attachment + holder when the modal is abandoned mid-scan.
function cancelScan(useBeacon) {
	if (scanPollTimer) {
		clearTimeout(scanPollTimer);
		scanPollTimer = null;
	}
	if (!scanHandle)
		return;
	var params = "sysparm_process_stage=cancel" +
		"&sysparm_att_id=" + encodeURIComponent(scanHandle.attId) +
		"&sysparm_holder_id=" + encodeURIComponent(scanHandle.holderId);
	if (useBeacon && navigator.sendBeacon) {
		navigator.sendBeacon(IMPORT_PROCESSOR, new Blob([params], { type: 'application/x-www-form-urlencoded' }));
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", IMPORT_PROCESSOR);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		addUserToken(xhr);
		xhr.send(params);
	}
	scanHandle = null;
}

function addUserToken(xhr) {
	if (typeof g_ck !== 'undefined' && g_ck)
		xhr.setRequestHeader("X-UserToken", g_ck);
}

function setScanBusy(busy) {
	if (gel('footer_upload_button')) gel('footer_upload_button').disabled = busy;
	if (gel('attachFile')) gel('attachFile').disabled = busy;
	if (gel('download_template_button')) gel('download_template_button').disabled = busy;
}

function showScanStatus(kind, msg) {
	var box = gel('scan_status');
	if (!box)
		return;
	box.style.display = 'block';
	box.className = 'scan-status scan-status-' + kind;
	if (gel('scan_status_text'))
		gel('scan_status_text').textContent = msg;
	if (gel('scan_status_bar'))
		gel('scan_status_bar').style.display = (kind === 'progress') ? 'block' : 'none';
}

function succeedScan(msg) {
	setScanBusy(false);
	showScanStatus('success', "✓ " + msg);
	// Let the user read the count, then close and refresh the Test Run Data Sets related list.
	setTimeout(function() {
		try {
			if (typeof GlideDialogWindow !== 'undefined' && GlideDialogWindow.get())
				GlideDialogWindow.get().destroy();
		} catch (e) {}
		try { top.location.reload(); } catch (e) { window.location.reload(); }
	}, 1200);
}

function failScan(msg) {
	setScanBusy(false);
	showScanStatus('error', "✗ " + msg);
}

function stripError(resp) {
	if (resp && resp.indexOf('error,') === 0)
		return resp.substring('error,'.length);
	return getMessage("The import could not be completed.");
}

function formOnLoad() {
    //method only for >=ie9 browsers.
    if (gel('output_messages'))
        placeInfoMessagesBelowHeader();

    var importAllowed = gel('import_allowed').value;
    if (importAllowed == 'none') {
        var form = document.forms[0];
        for (var i = 0; i < form.elements.length; i++)
            form.elements[i].disabled = true;
    }

    // DEF0814994: if the page/modal is abandoned while a scan is in flight, clean up the transient
    // attachment + holder record so no orphaned scan rows are left behind.
    window.addEventListener('beforeunload', function() {
        if (scanHandle)
            cancelScan(true);
    });
}

function getTemplateType() {
    var templateType = 'insert';
    var sysparm_template_type = gel('sysparm_template_type');
    if(sysparm_template_type)
        templateType = sysparm_template_type.value;
    return templateType;
}

function setTemplateType(value) {
    gel('sysparm_template_type').value = value;
}
