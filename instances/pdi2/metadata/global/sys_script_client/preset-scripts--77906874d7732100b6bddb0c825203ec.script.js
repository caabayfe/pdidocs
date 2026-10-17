function onChange(control, oldValue, newValue, isLoading) {
//sets the default script unless one already exists- then it looks for the default function declaration and modifies it to match the new type
   if(isLoading)
      return;
 
   if(!g_scratchpad.execute_function || g_scratchpad.execute_function == "false")
      return;

   var script = g_form.getValue('script');
   var name_map = {   
       before : "function onBefore(current, previous)",
       after : "function onAfter(current, previous)",
       async : "function onAsync(current)",
       async_always : "function onAsync(current)",
       before_display : "function onDisplay(current, g_scratchpad)"
   }
   
   //workaround for old value always being the first original value
   if(g_scratchpad._lastNameChangedTo)
       oldValue = g_scratchpad._lastNameChangedTo + '';

   g_scratchpad._lastNameChangedTo = newValue;
   if(script.toString()) {
   	//before_display is the worst name ever
	   var when = oldValue;
	   if(oldValue == "before_display")
		   when = "display";

	   if(oldValue == "async_always")
		   when = "async";

      //replace the existing function declaration with our new one
      //the arguments should match our defaults
      var functionName = "on" + when.charAt(0).toUpperCase() + when.slice(1);
      var search = new RegExp("\\bfunction\\s+" + functionName + "\\s*\\(\\s*(current)?\\s*,?\\s*(previous|g_scratchpad)?\\s*\\)","g");
	  script =  script.replace(search, name_map[newValue]);
	  g_form.setValue("script",script);
	  return;
   }     
   //the templates and isDefaultTemplate are loaded globally in an onLoad client script  
   var isMine = isDefaultTemplate(script);
   if (!isMine)
      return;
   
   switch (newValue) {
      case "before":
         script = template_onBefore;
         break;
      case "after":
         script = template_onAfter;
         break;
      case "async":
      case "async_always":
         script = template_onAsync;
         break;   
      case "before_display":
         script = template_onDisplay;
         break;
      default:
         break;
   }
   
   g_form.setValue('script', script);
}
