function onLoad() {
   /***
    * For "maintenance" type schedules, locate the option for floating (value will be null) and remove it 
    * as it is not a valid choice for this type of schedule.  Also, hide the "type" and "parent" fields to
    * simplify the form.
    ***/
   var scheduleType = g_form.getElement("type");
   if (!scheduleType)
      return;  // if it's not on the form, we cannot check it

   if (scheduleType.value != "maintenance")
      return;

   g_form.setDisplay("type", false);
   g_form.setDisplay("parent", false);

   var timeZoneSelect = g_form.getElement("time_zone");
   if (!timeZoneSelect)
      return;  // if it's not on the form, we cannot change it
   
   g_form.removeOption('time_zone','');
}
