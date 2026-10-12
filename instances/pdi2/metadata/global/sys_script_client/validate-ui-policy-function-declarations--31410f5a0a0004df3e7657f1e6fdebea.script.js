function onSubmit() {
   if (g_form.getValue("run_scripts") != "true")
      return;
   
   // NOTE: validateFunctionDeclaration is a UI Script
   var scriptTrueOK = validateFunctionDeclaration("script_true", "onCondition");
   var scriptFalseOK = validateFunctionDeclaration("script_false", "onCondition");

   return (scriptTrueOK && scriptFalseOK);
}
