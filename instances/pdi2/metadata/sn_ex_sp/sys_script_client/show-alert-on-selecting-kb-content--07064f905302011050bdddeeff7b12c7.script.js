function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var ga = new GlideAjax('TopicTemplateUtilSNC');
   ga.addParam('sysparm_name', 'showAlertOnSelectingKB');
   ga.addParam('sysparm_kb_sys_id',newValue.toString());
   ga.getXML(getResponse);
  
}
function getResponse(serverResponse) {
   var result = serverResponse.responseXML.documentElement.getAttribute('answer') === 'true';
   if(result){
      g_form.addInfoMessage(getMessage('All translated versions of the selected Knowledge article will be automatically added.'));
   }
}
