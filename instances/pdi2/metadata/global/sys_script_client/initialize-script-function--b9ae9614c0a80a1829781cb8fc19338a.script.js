function onChange(control, oldValue, newValue) {
   var script = g_form.getValue('script');
   if (oldValue == newValue && script != "")
      return;
   
   var newScript;
   if (newValue == "onChange")
      newScript = "function onChange(sysId, oldValue, newValue) {}";
   else if (newValue == "onSubmit")
      newScript = "function onSubmit() {}";
   else
      return;
      
   if (script != newScript)
      g_form.setValue('script', newScript);
}
