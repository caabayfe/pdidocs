function onChange(control, oldValue, newValue) {
   
   var script = g_form.getValue('script');
   
   var isMine = false;
   if (script == '' ||
       script == template_onChange.replace(/\r/g, "") || script == template_onChange ||
       script == template_onLoad.replace(/\r/g, "") || script == template_onLoad ||
       script == template_onSubmit.replace(/\r/g, "") || script == template_onSubmit ||
       script == template_onCellEdit.replace(/\r/g, "") || script == template_onCellEdit)
      isMine = true;
   
   if (!isMine)
      return;
   
   if (newValue.indexOf('Change') > -1)
      script = template_onChange;
   if (newValue.indexOf('Load') > -1)
      script = template_onLoad;
   if (newValue.indexOf('Submit') > -1)
      script = template_onSubmit;
   if (newValue.indexOf('CellEdit') > -1)
      script = template_onCellEdit;
   if (newValue == "")
      script = "";
   
   g_form.setValue('script', script);
}

var template_onCellEdit = "function onCellEdit(sysIDs, table, oldValues, newValue, callback) {\r\n  var saveAndClose = true;\r\n //Type appropriate comment here, and begin script below\r\n \r\n callback(saveAndClose); \r\n}";
var template_onChange = "function onChange(control, oldValue, newValue, isLoading, isTemplate) {\r\n   if (isLoading || newValue === '') {\r\n      return;\r\n   }\r\n\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
var template_onLoad = "function onLoad() {\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
var template_onSubmit = "function onSubmit() {\r\n   //Type appropriate comment here, and begin script below\r\n   \r\n}";
