(function executeRule(current, previous) {

    // NORMALIZE INPUT
    var originalCode = (current.code + '');
    var trimmedCode = originalCode.trim();
    var normalizedCode = trimmedCode.toLowerCase();

    // PREVENT EMPTY VALUES
    if (!trimmedCode) {

        gs.addErrorMessage(gs.getMessage('Redaction Code cannot be empty.'));

        current.setAbortAction(true);
        action.setRedirectURL(current);

        return;
    }

    // PREVENT LEADING/TRAILING SPACES
    if (originalCode !== trimmedCode) {

        gs.addErrorMessage(gs.getMessage('Redaction Code cannot start or end with spaces.'));

        current.setAbortAction(true);
        action.setRedirectURL(current);

        return;
    }

    // PREVENT MULTIPLE CONSECUTIVE SPACES
    if (/\s{2,}/.test(trimmedCode)) {

        gs.addErrorMessage(gs.getMessage('Redaction Code cannot contain multiple consecutive spaces.'));

        current.setAbortAction(true);
        action.setRedirectURL(current);

        return;
    }

    // CHECK FOR CASE-INSENSITIVE DUPLICATES
    var gr = new GlideRecord('ds_redaction_code');

    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.query();

    while (gr.next()) {

        var existingCode = (gr.code + '').trim().toLowerCase();

        if (existingCode === normalizedCode) {

            gs.addErrorMessage(gs.getMessage('Redaction Code already exists. Please use a unique value.'));

            current.setAbortAction(true);
            action.setRedirectURL(current);

            return;
        }
    }

})(current, previous);
