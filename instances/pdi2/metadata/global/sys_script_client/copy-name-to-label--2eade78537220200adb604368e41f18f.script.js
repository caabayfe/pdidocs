function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '')
       return;

   var oldLabel = g_form.getValue('label')+'';
   var newLabel = newValue+'';

   if (newValue.indexOf("u_") === 0)
       newLabel = newValue.substring(2);

   newLabel = newLabel.replace(/_/g," ");

   newLabel = toTitleCase(newLabel);

   if (oldLabel === '') {
       g_form.setValue('label', newLabel);
   }
}

function toTitleCase(s){
    return s.replace(/([^\s:\-])([^\s:\-]*)/g,function($0,$1,$2){
        return $1.toUpperCase()+$2.toLowerCase();
    });
}
