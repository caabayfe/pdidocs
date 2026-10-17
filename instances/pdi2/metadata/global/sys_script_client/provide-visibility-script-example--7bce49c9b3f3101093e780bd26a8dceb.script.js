function onLoad() {
   if (g_form.getValue('scripted_visibility') === "false" && !g_form.getValue('ui_action_visibility_script')) {
       var example = "";
       example += "(function(result) {\n";
       example += "\t/**\n";
       example += "\t* result: The GlideRecord object for a search result.\n";
       example += "\t* \n";
       example += "\t* Use the standard functions of the result GlideRecord to return whether you want to show this UI action or not (boolean).\n";
       example += "\t* \n";
       example += "\t* Example:\n";
       example += "\t* \treturn result.getValue('active') === '1';\n";
       example += "\t*/\n";
       example += "\treturn true;\n";
       example += "}) (result);";
       g_form.setValue('ui_action_visibility_script', example);
   }
}
