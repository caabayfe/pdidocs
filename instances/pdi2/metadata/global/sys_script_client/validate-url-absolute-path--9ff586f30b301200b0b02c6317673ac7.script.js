function onSubmit() {
   // Ensure absolute path
   var url = g_form.getValue("url");
   var isAbsolute = /^(?:\/|[a-z]+:\/\/)/.test(url);
   if (g_form.getValue('source') == "url" && !isAbsolute){
	   g_form.addErrorMessage(getMessage('The dependency url must be an absolute path'));
	   return false;
   }
}
