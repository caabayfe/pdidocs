function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading)
      return;

   var script=g_form.getValue('script');
   jslog("Set Log");

   var lines = script.split('\n');
   for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (l.indexOf('jslog') >= 0) {
         var s = l.indexOf('(');
         var e = l.indexOf(')');
         var left = l.substring(0, s+1);
         var right = l.substring(e);
         lines[i] = left + '"' + newValue + '"' + right;
         break;
      }
   }

  g_form.setValue('script', lines.join('\n'));

}
