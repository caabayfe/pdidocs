function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   // Pass a callback function ('setPropertyName') to make it asynchronous
    g_form.getReference('sys_property', setPropertyName); 

    function setPropertyName(caller) {
        // 'caller' is the object returned from the server containing the record's data
        g_form.setValue('property_name', caller.name); 
    }
   
}
