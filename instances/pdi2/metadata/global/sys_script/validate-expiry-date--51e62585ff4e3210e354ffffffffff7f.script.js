(function executeRule(current, previous) {

    var isNew = current.isNewRecord();

    var expiryCleared =
        current.expiry_date.nil() &&
        previous &&
        previous.expiry_date &&
        !previous.expiry_date.nil();

    var expirySetOrChanged = !current.expiry_date.nil() &&
        (isNew || current.expiry_date.changes());

    /* CASE 1: Expiry date CLEARED */
    if (expiryCleared) {

        if (current.state == 'expired')
            setStateBasedOnDefaultVersion(current);

        return;
    }

    /* CASE 2: Expiry date SET or MODIFIED */
    if (expirySetOrChanged) {

        if (!isFutureDate(current.expiry_date)) {
            gs.addErrorMessage(
                gs.getMessage('Expiry date must be at least one day from today.')
            );
            current.setAbortAction(true);
            return;
        }

        if (!isNew && current.state == 'expired')
            setStateBasedOnDefaultVersion(current);

        return;
    }

    /* CASE 3: No expiry change → do nothing */
    return;

})(current, previous);

/**
 * Sets document state based on default version status
 * - published → active
 * - otherwise → draft
 */
function setStateBasedOnDefaultVersion(current) {

    var state = 'draft';

    if (!current.default_version.nil()) {
        var verGR = new GlideRecord('ds_document_version');
        if (verGR.get(current.default_version)) {

            var versionState = verGR.getValue('version_state');

            var activeStates = [
                'published',
                'awaiting_review',
                'awaiting_approval',
                'ready_for_publish',
                'approved',
                'reviewed',
                'rejected'
            ];

            if (activeStates.indexOf(versionState) > -1)
                state = 'active';
        }
    }

    current.state = state;
}

/* Checks if a date is at least tomorrow */
function isFutureDate(dateValue) {

    var todayStr = new GlideDate().getValue();

    var daysDiff = parseInt(
        gs.dateDiff(todayStr, dateValue, false),
        10
    );

    return daysDiff >= 1;
}
