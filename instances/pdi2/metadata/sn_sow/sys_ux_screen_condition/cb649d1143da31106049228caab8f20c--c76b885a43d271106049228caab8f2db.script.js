(function evaluate(params) {
    if (params.data.sysId != "-1" && params.data.table == 'sn_uni_task_universal_task') {
        var universalTask = new GlideRecordSecure('sn_uni_task_universal_task');
        if (universalTask.get(params.data.sysId)) {
            if (universalTask.getValue("type") == 'checklist') {
                return true;
            }
        }
    }
    return false;
})(inputProperties);
