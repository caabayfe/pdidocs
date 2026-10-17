function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   
   if (isLoading || newValue === '') {
      return;
   }
  
   if (newValue === 'JDBC'){
	  try {
         var jdbcElement = $('label.' +  g_form.getControl('format').id);
         jdbcElement.select('.label-text').each(function(elmt) {
            elmt.setAttribute('data-original-title','Format of the database');     
         });
      } catch(e){}
   }   
   if (newValue === 'File'){
	  try {
         var labelElement = $('label.' +  g_form.getControl('format').id);
         labelElement.select('.label-text').each(function(elmt) {
            elmt.setAttribute('data-original-title','Format of the data file');     
         });
      } catch(e){}
   }
}
