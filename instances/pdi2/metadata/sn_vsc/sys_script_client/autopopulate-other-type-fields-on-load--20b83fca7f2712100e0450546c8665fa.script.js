function onLoad() {
    if (!g_form.isNewRecord())
        return;

    //Use task parameters passed in to auto-fill or use the default values of Other taskType
    var urlParams = new URLSearchParams(top.location.search);
    var taskType = urlParams.get("task_type");
    if (!taskType)
        taskType = 'other';

    g_form.setValue('type', taskType);
    var taskPriority = urlParams.get("task_priority");
    if (taskPriority)
        g_form.setValue('priority', taskPriority);

    var taskShortDescription = urlParams.get("task_short_description");
    if (taskShortDescription)
        g_form.setValue('short_description', taskShortDescription);
    else getMessage(taskType + ".task.short_description", function(msg) {
        g_form.setValue('short_description', msg);
    });

    var taskDetails = urlParams.get("task_details");
    if (taskDetails)
        g_form.setValue('details', taskDetails);
    else getMessage(taskType + ".task.details", function(msg) {
        g_form.setValue('details', msg);
    });

    var sourceTable = urlParams.get("source_table");
    if (sourceTable)
        g_form.setValue('source_table', sourceTable);

    var sourceRecord = urlParams.get("source_record");
    if (sourceRecord)
        g_form.setValue('source_record', sourceRecord);

}
