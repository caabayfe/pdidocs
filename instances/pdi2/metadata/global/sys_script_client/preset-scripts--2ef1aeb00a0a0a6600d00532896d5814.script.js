function onChange(control, oldValue, newValue) { 
			
    var script = g_form.getValue('script'); 
			
    var isMine = false;
    if (script == template_onChange.replace(/\r/g, ""))
        isMine = true;
    if (script == template_onLoad.replace(/\r/g, ""))
        isMine = true;
    if (script == template_onSubmit.replace(/\r/g, ""))
        isMine = true;
    if (script == '')
        isMine = true;
			
    if (!isMine)
        return;
			
    if (newValue.indexOf('Change') > -1)
        script = template_onChange; 
    if (newValue.indexOf('Load') > -1)
        script = template_onLoad; 
    if (newValue.indexOf('Submit') > -1)
        script = template_onSubmit; 
			
    g_form.setValue('script', script); 		
}

var template_onChange = "function onChange(control, oldValue, newValue, isLoading) {\r\n   if (isLoading || newValue == '') {\r\n      return;\r\n   }\r\n\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
var template_onLoad = "function onLoad() {\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
var template_onSubmit = "function onSubmit() {\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
