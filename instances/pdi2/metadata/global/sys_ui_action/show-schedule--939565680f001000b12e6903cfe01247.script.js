function showScheduleInCalendar() {
   var id = g_form.getUniqueValue();
   var url = 'show_schedule.do?sysparm_stack=no';
   url += '&sysparm_sys_id=' + id;
   window.g_navigation.openPopup(url, 'show_schedule', '', false);

}
