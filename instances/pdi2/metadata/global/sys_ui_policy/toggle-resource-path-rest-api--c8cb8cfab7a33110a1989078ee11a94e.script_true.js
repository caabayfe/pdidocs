function onCondition() {
    // Clean up rest_api field
    g_scratchpad.svcOptionInfos["selectedRestAPI"] = g_form.getValue("rest_api");
    g_form.setValue("rest_api", "");

    // Populate resource_path field
    var selectedResourcePath = g_scratchpad.svcOptionInfos["selectedResourcePath"];
    if (selectedResourcePath != undefined)
        g_form.setValue("resource_path", selectedResourcePath);
}
