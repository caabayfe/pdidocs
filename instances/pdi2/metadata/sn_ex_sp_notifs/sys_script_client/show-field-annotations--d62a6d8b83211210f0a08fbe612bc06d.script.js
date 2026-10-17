function onLoad() {
    var contentTemplateMsg = getMessage("This message will be displayed in the notification. It supports variable templating, allowing you to substitute variables using a syntax similar to gs.getMessage. Variables can be replaced using parameters like {0}, {1}, etc. Example: Incident {0} has been assigned to {1}");
    var contentParamsMsg = getMessage("These are comma-separated values corresponding to the record fields. They will be substituted into the Content Template to generate the final notification message. Example: ${number},${assigned_to}");
    var actionUrlMsg = getMessage("This is the URL where the redirection will occur when a user clicks on the notification. Example: /esc?id=ticket&table=incident&sys_id=${sys_id}");
    var advancedMsg = getMessage("Advanced option supports scripting to dynamically generate the content template. It also allows for the grouping of unseen notifications related to the same record.");

    g_form.showFieldMsg("content_template", contentTemplateMsg, "info");
    g_form.showFieldMsg("content_params", contentParamsMsg, "info");
    g_form.showFieldMsg("action_url", actionUrlMsg, "info");
    g_form.showFieldMsg("advanced", advancedMsg, "info");

}
