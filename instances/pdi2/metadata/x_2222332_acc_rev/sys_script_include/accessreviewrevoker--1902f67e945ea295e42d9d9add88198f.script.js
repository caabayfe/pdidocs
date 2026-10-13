var AccessReviewRevoker = Class.create();
AccessReviewRevoker.prototype = {
    initialize: function() {},

    // Removes the access a revocation task names (FR-09, SR-06). The platform does not let a
    // scoped application delete role assignments or memberships, so a global helper removes
    // it after checking the task. A refused removal keeps the task open: the evidence must
    // never say access is gone when it is not.
    revoke: function(task) {
        var outcome = new global.AccessReviewAccessRemover().remove(task.getUniqueValue());
        var access = task.getDisplayValue(task.getValue('access_type') == 'role' ? 'role' : 'group');
        if (outcome == 'refused') {
            gs.addErrorMessage(gs.getMessage('The access could not be removed, so the task stays open.'));
            task.work_notes = 'Removal of ' + access + ' from ' + task.subject_user.getDisplayValue()
                + ' was refused: the task is closed, or the assignment no longer matches it.';
            task.update();
            return false;
        }
        task.setValue('outcome', outcome);
        task.work_notes = outcome == 'removed'
            ? 'Removed ' + access + ' from ' + task.subject_user.getDisplayValue()
                + ' (assignment ' + task.getValue('source_id') + ').'
            : 'The access was already removed; nothing to do.';
        task.setValue('state', '3');
        task.update();
        return outcome == 'removed';
    },

    type: 'AccessReviewRevoker'
};
