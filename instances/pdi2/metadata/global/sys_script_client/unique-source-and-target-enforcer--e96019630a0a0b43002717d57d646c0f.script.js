function onChange(control, oldValue, newValue, isLoading) {
   var test = g_form.getControl('target_table');
   
   if (typeof this.oldNode != 'undefined') 
    test.insertBefore(this.oldNode, test.childNodes[this.oldNodeLocation]);
   
   for (var i = 0; i < test.childNodes.length; i++) {
      if(test.childNodes[i].value == newValue && !isEmpty(newValue)) {
         this.oldNodeLocation = i;
         this.oldNode = test.childNodes[i];
         test.removeChild(this.oldNode);
      }
   }
}

function isEmpty(value) {	
	return (!value || value.length == 0);
}	
