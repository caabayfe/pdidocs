function jobStateChanged() {
    var jobType = document.getElementById('job_type').value;
    if (jobType == 'HIERARCHY_CHANGE') {
        var stateActiveValue = document.getElementById('job_active').value;
        if (stateActiveValue == 'active') {
            document.getElementById('auto_resume').style.visibility = 'hidden';
            document.getElementById('auto_resume_label').style.visibility = 'hidden';
        } else {
            document.getElementById('auto_resume').style.visibility = 'visible';
            document.getElementById('auto_resume_label').style.visibility = 'visible';
        }
    }
    document.getElementById('button_id_save').disabled = false;
}

function updateJobState() {
    var jobTypeAPI = document.getElementById('job_type').value;
    var jobTypeText = document.getElementById('job_type').textContent;
    var stateActiveValue = document.getElementById('job_active').value;
    var labelActiveValue = stateActiveValue == 'active' ? getMessage('Active') : getMessage('Paused');
    var autoResumeCheckboxValue = document.getElementById('auto_resume').checked;
	var autoResumeCheckboxVisbility = document.getElementById('auto_resume').style.visibility;
    var ga = new GlideAjax('DomainJobTypesAjax');
    ga.addParam('sysparm_name', 'updateJobState');
    ga.addParam('sysparm_job_type_api', jobTypeAPI);
    ga.addParam('sysparm_state_value', stateActiveValue);
    ga.addParam('sysparm_auto_resume_value', autoResumeCheckboxValue);
    ga.getXMLAnswer(function(response) {
        var g_form = new GlideForm();
        var autoResumeMessage = autoResumeCheckboxVisbility == 'visible' && autoResumeCheckboxValue ? "The job state is scheduled to automatically activate in 1 hour." : "";
        var message = new GwtMessage().format("Set domain job type '{0}' to '{1}'. {2}", jobTypeText, labelActiveValue, autoResumeMessage);
        g_form.addInfoMessage(message);
    });
}
