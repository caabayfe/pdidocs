function impOk() {
   var is_ok = false;
   var sys_user = gel(gel('impersonate_query').value);
   if (sys_user.value != '')
      is_ok = true;
   var imp_recent = gel('imp_recent');
   
   if (imp_recent.value != '')
      is_ok = true;
   
   if (!is_ok) {
      alert('Please select a user to impersonate');
      return false;
   }

   var form = document.forms['form.' + '${sys_id}'];
   addInput(form, "HIDDEN", "sys_user", sys_user.value);

   return true;
}

function clearSelect() {
   var sel = gel('imp_recent');
   for (var i =0; i<sel.options.length; i++)
       sel.options[i].selected = false;

}

function clearRef() {
   var sys_user = gel(gel('impersonate_query').value);
   sys_user.value = "";
   var display = gel('sys_display.' + gel('impersonate_query').value);
   display.value = "";
   setLightWeightLink('sys_user');
}
