function showScheduleInCalendar() {
   var id = g_form.getUniqueValue();
   var url = 'now/nav/ui/schedule/cmn_schedule/' + id;
   g_navigation.openPopup(url,"show_schedule",'',false);

}
