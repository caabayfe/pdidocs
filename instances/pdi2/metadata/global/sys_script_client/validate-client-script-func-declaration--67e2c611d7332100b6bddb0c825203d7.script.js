function onSubmit() {

    var functionName;
    var when = g_form.getValue("when");
    var table = g_form.getValue("collection");

    if (!g_scratchpad.execute_function || g_scratchpad.execute_function == "false")
        return true;

    if (table == "global")
        return true;

    if (when == "")
        return true;

    if (when == "before_display")
        when = "display";

    if (when == "async_always")
        when = "async";

    functionName = "on" + when.charAt(0).toUpperCase() + when.slice(1);

    // NOTE: validateFunctionDeclaration is a UI Script
    return validateFunctionDeclaration("script", functionName) && validateNotCallingFunction("script", functionName);
}
