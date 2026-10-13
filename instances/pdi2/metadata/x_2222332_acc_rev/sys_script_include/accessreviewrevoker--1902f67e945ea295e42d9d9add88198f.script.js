var AccessReviewRevoker = Class.create();
AccessReviewRevoker.prototype = {
    initialize: function() {},

    // Removes the access a revocation task names, only if the source assignment still grants
    // exactly that access to that user (SR-06), then closes the task (FR-09).
    revoke: function(task) {
        var role = task.getValue('access_type') == 'role';
        var source = new GlideRecord(role ? 'sys_user_has_role' : 'sys_user_grmember');
        var granted = source.get(task.getValue('source_id'))
            && source.getValue('user') == task.getValue('subject_user')
            && source.getValue(role ? 'role' : 'group') == task.getValue(role ? 'role' : 'group');
        var removed = granted && source.deleteRecord();
        task.setValue('outcome', removed ? 'removed' : 'already_removed');
        task.work_notes = removed
            ? 'Removed ' + task.getDisplayValue(role ? 'role' : 'group') + ' from '
                + task.subject_user.getDisplayValue() + ' (assignment ' + task.getValue('source_id') + ').'
            : 'The access was already removed; nothing to do.';
        task.setValue('state', '3');
        task.update();
        return removed;
    },

    type: 'AccessReviewRevoker'
};
