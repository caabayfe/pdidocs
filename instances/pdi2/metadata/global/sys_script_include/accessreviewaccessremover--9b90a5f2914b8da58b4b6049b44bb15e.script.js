var AccessReviewAccessRemover = Class.create();
AccessReviewAccessRemover.prototype = {
    initialize: function() {},

    // Removes the access an open Access Review revocation task names, and only that: the task
    // must be open, and its assignment must still grant exactly that access to that user. The
    // platform refuses these deletes from a scoped application, so the check lives here.
    // Returns removed, already_removed or refused.
    remove: function(taskId) {
        var task = new GlideRecord('x_2222332_acc_rev_revocation');
        if (!task.get(taskId) || !task.active) {
            return 'refused';
        }
        var role = task.getValue('access_type') == 'role';
        var source = new GlideRecord(role ? 'sys_user_has_role' : 'sys_user_grmember');
        if (!source.get(task.getValue('source_id'))) {
            return 'already_removed';
        }
        var same = source.getValue('user') == task.getValue('subject_user')
            && source.getValue(role ? 'role' : 'group') == task.getValue(role ? 'role' : 'group');
        if (!same) {
            return 'refused';
        }
        return source.deleteRecord() ? 'removed' : 'refused';
    },

    type: 'AccessReviewAccessRemover'
};
