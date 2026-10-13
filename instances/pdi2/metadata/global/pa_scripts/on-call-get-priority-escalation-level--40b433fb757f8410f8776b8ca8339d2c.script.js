function getTaskRecord() {
    if (GlideDBObjectManager.get().getBase(current.escalation.table + '') == 'task') {
        var taskGR = new GlideRecord(current.escalation.table + '');
        if (taskGR.get(current.escalation.source + ''))
            return taskGR.getValue('priority');
    } else {
        return null;
    }
}

getTaskRecord();
