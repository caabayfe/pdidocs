function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

    if (typeof window !== 'undefined' && window && window.NOW && window.NOW.SyntaxEditor && window.NOW.SyntaxEditor.sanitizeVarName) {
        newValue = window.NOW.SyntaxEditor.sanitizeVarName(newValue);
    }

    var scope = g_scratchpad.scope;
    scope = scope + '.';

    g_form.setDisabled("api_name",false);
    g_form.setValue("api_name", scope + newValue);
    g_form.setReadOnly("api_name",true);
}
