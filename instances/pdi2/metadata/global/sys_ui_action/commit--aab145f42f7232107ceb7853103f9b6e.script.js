function commitRecord() {
    var dialog = new GlideModal('glide_confirm_standard');
    dialog.setTitle('Confirm Commit');
    dialog.setPreference('title', 'Committing this record will apply the changes to the resource. If successful, the staging record will be deleted.');
    dialog.setPreference('warning', true); // Red warning style like delete

    dialog.setPreference('onPromptComplete', function() {
        performCommit();
    });

    dialog.render();
    return false;
}

function performCommit() {
	var gwt = new GwtMessage();
    g_form.addInfoMessage(getMessage('Committing record'));

    var ga = new GlideAjax('RestRequestSchemaStagingProcessor');
    ga.addParam('sysparm_name', 'commitRecord');
    ga.addParam('sysparm_staging_sys_id', g_form.getUniqueValue());

    ga.getXMLAnswer(function(response) {
        g_form.clearFormMessages('info');
        var result = JSON.parse(response);
        if (result.success) {
            g_form.addInfoMessage(result.message);
			g_form.addInfoMessage(getMessage('Redirecting to resource'));
            setTimeout(function() {
                   top.location.href  = result.redirect_url;
            }, 1500);

        } else {
			var msg = result.message;
			if (msg.includes('Request spec already exists')) {
				g_form.addInfoMessage(getMessage('Request spec already exists'));
			} else {
				g_form.addInfoMessage(getMessage('Failed to add schema component'));
			}
        }
    });
}
