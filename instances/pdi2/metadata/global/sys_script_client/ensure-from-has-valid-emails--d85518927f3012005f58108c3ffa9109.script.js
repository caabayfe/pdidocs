// Call the EmailAddressValidator whenever the From field loads or is updated
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

   var ga = new GlideAjax('AJAXEmailAddressValidator');
   ga.addParam('sysparm_name', 'filterOutValid');
   ga.addParam('sysparm_addresses', newValue);
   ga.getXMLAnswer(displayInvalidAddresses);
}

// Show the invalid 'From' addresses
function displayInvalidAddresses(answer) {
   
   if (answer && answer.length > 0) {
      var errorString = new GwtMessage().getMessage('From contains an invalid address: ') + answer;
      g_form.showErrorBox('from', errorString); 
   }
}
