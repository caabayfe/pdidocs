(function executeRule(current, previous /*null when async*/ ) {
    // delete all the tasks for this request item
    var task = new GlideRecord("sc_task");
    task.addQuery("request_item", "=", current.sys_id);
    task.deleteMultiple();
})(current, previous);
