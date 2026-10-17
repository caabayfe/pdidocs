function onLoad() {
   // Remove the workflow choice item if it is not selected on entry
   var wait_for = g_form.getValue('wait_for');
   if (wait_for != 'workflow')
      g_form.removeOption('wait_for', 'workflow');
}
