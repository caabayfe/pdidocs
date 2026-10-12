function onSubmit() {
   //take only the intersection of two lists
   var attributes = g_form.getValue('attributes');
   var null_update = g_form.getValue('null_update');
   var intersection = intersect(attributes, null_update);
   g_form.setValue('null_update', intersection);
   if (null_update && (!intersection || null_update.length!=intersection.length)) {
      alert(getMessage('Attributes not chosen in the Attributes bucket were ignored for forcing null update'));
   }
}

function intersect(attributes, nullUpdates) {
   if (!attributes) // empty means row-wise
      return nullUpdates;
	
   var nups = nullUpdates.split(',');
   var len = nups.length;
   var rets = [];
   for (var i=0; i<len; i++) {
      if (attributes.indexOf(nups[i]) >= 0)
         rets.push(nups[i]);
   }
   return rets.join(',');
}
