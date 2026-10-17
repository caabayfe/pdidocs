/**
 * Calls the method to handle data deletion and staging when the user provides 
 * a valid number of days for deletion and confirms readiness for staging.
 * 
 */
function continueOK() {
    var stagingRetentionDays = document.getElementById('stagingRetentionDays').value.trim();
    if (!stagingRetentionDays || isNaN(stagingRetentionDays) || parseInt(stagingRetentionDays) < 7 || parseInt(stagingRetentionDays) > 180) {
        showWarningMessage(getMessage('You must provide a valid number of days before deletion.'));
        return;
    }

    var gax = new GlideAjax('DeleteDomainUtilsAjax');
    gax.addParam('sysparm_name', 'plannedDeletionDateOverlapping');
    gax.addParam('sysparm_staging_retention_days', stagingRetentionDays);
    gax.getXMLAnswer(function(response) {
        try {
            var jsonResponse = JSON.parse(response);
            if (jsonResponse.success) {
                showWarningMessage(getMessage('Domains are already scheduled for deletion on this date. Set a different retention days after staging.'));
                return;
            }
            initiateDomainStaging(stagingRetentionDays);
        } catch (e) {
            gs.error('Error parsing server response: ' + e.message);
			GlideModal.get().destroy();
        }
    });
}

function initiateDomainStaging(stagingRetentionDays) {
    var ga = new GlideAjax('DomainTransferToStagingAjax');
    ga.addParam('sysparm_name', 'moveDomainsToStaging');
    ga.addParam('sysparm_staging_retention_days', parseInt(stagingRetentionDays, 10));
    ga.getXMLAnswer(function(response) {
        var g_form = new GlideForm();
        if (response) {
            try {
                var parsedResponse = JSON.parse(response);
                if (parsedResponse.success) {
                    g_form.addInfoMessage(getMessage('Move_Domains_To_Staging_Ajax_Success'));
                    var uiActionButton = document.getElementById('move_to_staging');
                    if (uiActionButton) {
                        uiActionButton.disabled = true; // Disable the button
                    }
					GlideModal.get().destroy();
                } else {
                    g_form.addErrorMessage(getMessage('Move_Domains_To_Staging_Ajax_Failure'));
                }
            } catch (e) {
                g_form.addErrorMessage(getMessage('Move_Domains_To_Staging_Ajax_Exception', e));
            }
        }
    });
}

function continueCancel() {
    GlideModal.get().destroy();
}

/**
 * Displays a warning message to the user if no valid number of days is provided 
 * for deleting the data. A valid days value must be greater than zero.
 * 
 */
function showWarningMessage(message) {
    var errorElement = document.getElementById('notification-warning');
    var errorMessageElement = document.getElementById('notification-warning-message');
    if (errorElement && errorMessageElement) {
        errorMessageElement.textContent = message;
        errorElement.style.display = 'block';
        return;
    }
}

function clearNotificationsMessages() {
    var errorElement = document.getElementById('notification-warning');
    errorElement.style.display = 'none';
}
