function onCondition() {
    // Clean up resource_path field
    g_scratchpad.svcOptionInfos["selectedResourcePath"] = g_form.getValue("resource_path");
    g_form.setValue("resource_path", "");

    // Populate rest_api field
    var selectedRestAPI = g_scratchpad.svcOptionInfos["selectedRestAPI"];
    if (selectedRestAPI != undefined)
        g_form.setValue("rest_api", selectedRestAPI);
}
