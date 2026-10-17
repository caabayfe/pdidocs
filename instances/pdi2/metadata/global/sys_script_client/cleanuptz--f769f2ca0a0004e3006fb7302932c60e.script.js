function onLoad() {
   var el = g_form.getControl('run_as_tz');
   if (!el)
      return;

   var first = el.options[0];
   first.text = getMessage("From Run As User");
}
