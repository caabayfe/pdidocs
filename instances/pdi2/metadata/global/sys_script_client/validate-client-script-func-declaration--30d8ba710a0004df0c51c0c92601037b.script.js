function onSubmit() {
    var functionName = g_form.getValue("type");
    if (functionName == "")
       return true;

    // NOTE: validateFunctionDeclaration is a UI Script
    return validateFunctionDeclaration("script", functionName);
}
