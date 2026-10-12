// Update the class name used for the Activity Definition Handler

function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading)
      return;

   newValue = makeNameValidJS(newValue);
   var script = g_form.getValue('script');
   if (script == '')
      setActDefClassName(newValue);
   else
      renameActDefClassName(newValue);
}

function makeNameValidJS(n) {
   return n.replace(/[^a-zA-Z0-9_]/g, "_");
}

function setActDefClassName(newName) {
   var script = "";
   script += "// Workflow activity definition handler class\n";
   script += "//\n";
   script += "// Implement activity definition handling in the onExecute method\n";
   script += "//\n";
   script += "// Implement any event handlers for the activity definition as a method named 'on[event_name]'\n";
   script += "//     For example, to handle the 'cancel' event, implement an 'onCancel' method\n";
   script += "//\n\n";

   script += "var " + newName + "ActivityHandler = Class.create();\n";
   script += newName + "ActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {\n\n";
   script += "   initialize: function() {\n";
   script += "      WFActivityHandler.prototype.initialize.call(this);\n";
   script += "   },\n\n";
   script += "   onExecute: function() {\n";
   script += "      // implement activity definition code here\n\n";
   script += "   },\n\n";
   script += "   type: '" + newName + "ActivityHandler'\n";
   script += "});";
   g_form.setValue('script', script);
}

function renameActDefClassName(newName) {
   // get the current class name from the script
   var script = g_form.getValue('script');
   var pattern = /var (.*)ActivityHandler \= Class\.create/;
   var matcher = script.match(pattern);
   if (!matcher)
      // no match - leave the script alone
      return;

   var oldName = matcher[1];
   pattern = new RegExp("var " + oldName + "ActivityHandler", "g");
   script = script.replace(pattern, "var " + newName + "ActivityHandler");   

   pattern = new RegExp(oldName + "ActivityHandler.prototype", "g");
   script = script.replace(pattern, newName + "ActivityHandler.prototype");   

   pattern = new RegExp("type: \'" + oldName + "ActivityHandler", "g");
   script = script.replace(pattern, "type: \'" + newName + "ActivityHandler");
   g_form.setValue('script', script);
}
