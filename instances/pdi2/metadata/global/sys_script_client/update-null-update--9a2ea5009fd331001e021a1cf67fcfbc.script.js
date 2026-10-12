function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   var oldNullUpdates = g_form.getValue('null_update');
   g_form.setValue('null_update', intersect(newValue, oldNullUpdates));
}

function intersect(attributes, nullUpdates) {
   var nups = nullUpdates.split(',');
   var len = nups.length;
   var rets = [];
   for (var i=0; i<len; i++) {
      if (attributes.indexOf(nups[i]) >= 0)
         rets.push(nups[i]);
   }
   return rets.join(',');
}
