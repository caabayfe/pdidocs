// Call the EmailAddressValidator whenever the Reply to field loads or is updated
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

   var ga = new GlideAjax('AJAXEmailAddressValidator');
   ga.addParam('sysparm_name', 'filterOutValid');
   ga.addParam('sysparm_addresses', newValue);
   ga.getXMLAnswer(displayInvalidAddresses);
}

// Show the invalid 'Reply to' addresses
function displayInvalidAddresses(answer) {   
   if (answer && answer.length > 0) {
      var errorString = new GwtMessage().getMessage('Reply-to contains an invalid address: ') + answer;
      g_form.showErrorBox('reply_to', errorString); 
   }
}
