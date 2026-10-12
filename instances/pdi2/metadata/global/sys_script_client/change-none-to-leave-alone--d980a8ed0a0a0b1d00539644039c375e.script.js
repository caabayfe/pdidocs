/* Used instead of NULL_OVERRIDE because the choices are being pulled from another table */

function onLoad() {
   var msg = g_scratchpad.msg_leave_alone;
   var r = g_form.getValue('risk');
   var i = g_form.getValue('impact');
   g_form.removeOption('risk', '');
   g_form.removeOption('impact', '');
   g_form.addOption('risk', '', msg, 0);
   g_form.addOption('impact', '', msg, 0);
   g_form.setValue('risk', r);
   g_form.setValue('impact', i);
}
