function onLoad() {
   if (g_form.getValue('advanced_visibility') === "false") {
       var comment = "/**\n";
       comment += "* Description: scripting condition for Search UI Action's visibility.\n";
       comment += "* Variables available:\n";
       comment += "* \tcurrent (GlideRecord): GlideRecord object of form record.\n";
       comment += "* \tresource (GlideRecord): GlideRecord object of search result record.\n";
       comment += "* Variable to set:\n";
       comment += "* \tvisible (boolean): Script writer needs to set this variable to true/false to determine whether to show/hide this UI action.\n";
	   comment += "* Example:\n";
       comment += "* \tvisible = current.getValue('parent_incident') !== resource.getUniqueValue();\n";
       comment += "*/\n";
       g_form.setValue('ui_action_visibility_script', comment);
   }
}
