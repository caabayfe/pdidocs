function getTaskRecordPriority() {
    if (GlideDBObjectManager.get().getBase(current.table + '') == 'task') {
        var taskGR = new GlideRecord(current.table + '');
        if (taskGR.get(current.source + ''))
            return taskGR.getValue('priority');
    } else {
        return null;
    }
}

getTaskRecordPriority();
