function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || !newValue || newValue == oldValue)
      return;

   var setLoc = g_form.hasField('location');
   var setComp = g_form.hasField('company');

   if (!setLoc && !setComp)
      return; // fields aren't on form, get out

   var caller = g_form.getReference('caller_id', setLocAndComp);
}

function setLocAndComp(caller) {
   var setLoc = g_form.hasField('location');
   var setComp = g_form.hasField('company');

   if (setLoc)
      g_form.setValue('location', caller.location);
   if (setComp)
      g_form.setValue('company', caller.company);
}
