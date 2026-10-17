/**
 * UI ACTION: Run / Retry Script (Client – Confirmation Dialog)
 * Table:     sn_instance_clone_cleanup_script_execution
 * Type:      Form button
 * Condition: status == 'failed' || status == 'not_executed' || status == 'ready'
 * Client:    true
 * Action name: (leave blank)
 */
function confirmAndRun() {
    var dialog = new GlideModal('glide_modal_confirm');
    dialog.setTitle('Confirm Script Execution');
    dialog.setPreference('body', 'Run this script? Once started, script execution cannot be canceled.'
    );
    dialog.setPreference('title', 'Confirm');
    dialog.setPreference('onPromptComplete', function () {
        gsftSubmit(null, g_form.getFormElement(), 'run_retry_script');
    });
    dialog.render();

    return false;
}

if (typeof window == 'undefined')
   executeAndRedirect();

function executeAndRedirect() {
    var LOG_PREFIX = '[PostCloneScriptsScheduler] UI Action – ';

    // ── Guard: CHG must be set and valid ──────────────────────────────────────
    var chgNumber = current.getValue('chg');
    if (!chgNumber || !chgNumber.startsWith('CHG')) {
        gs.error(LOG_PREFIX + 'Cannot retry: chg field is empty or invalid on sys_id=' + current.getUniqueValue());
        gs.addErrorMessage(gs.getMessage('Cannot retry: the Change Number (chg) field is missing or invalid.'));
        return;
    }

    // ── Guard: status must allow retry ────────────────────────────────────────
    // Belt-and-suspenders check — condition on UI Action 1 already filters,
    // but direct API callers won't hit that condition.
    var status = current.getValue('status');
    var retryableStatuses = { error: true, not_executed: true, ready: true };
    if (!retryableStatuses[status]) {
        gs.addInfoMessage(gs.getMessage('This script cannot be retried in its current status: {0}. Only error, not_executed, or ready scripts can be retried.', [status]));
        return;
    }

	var isMaxChgNumber = new PostCloneScriptsScheduler(chgNumber).isMaxChgNumber();
	if(!isMaxChgNumber) {
		gs.error(LOG_PREFIX + 'Cannot retry: CHG is not the latest change number for the current clone');
        gs.addErrorMessage(gs.getMessage('Cannot retry: CHG is not the latest chang number for the current clone'));
        return;
	}

    // ── Invoke scheduler ──────────────────────────────────────────────────────
    var sysId = current.getUniqueValue();
    var result;
    try {
        result = new sn_instance_clone.PostCloneScriptsScheduler(chgNumber).runScript(sysId);
    } catch (e) {
        gs.error(LOG_PREFIX + 'Unexpected error calling runScript for sys_id=' + sysId + ': ' + e);
        gs.addErrorMessage(gs.getMessage('An unexpected error occurred: {0}', [e.toString()]));
        return;
    }

    // ── Surface result to user ────────────────────────────────────────────────
    if (result && result.success) {
        gs.addInfoMessage(gs.getMessage('✔ {0}', result.message));
    } else {
        gs.addErrorMessage(gs.getMessage('✘ {0}. Unknown error from runScript.', [result.message]));
    }

    // ── Reload form so status reflects the reset to "scheduled" ──────────────
    action.setRedirectURL(current);
}
