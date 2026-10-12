function showScheduleInCalendar() {
    var id = g_form.getValue("schedule");
    if (!id){
        alert(getMessage("There is no schedule defined for this record"));
        return;
    }
        
    var url = "show_schedule.do?sysparm_stack=no";
    url += "&sysparm_sys_id=" + id;
    var w = getTopWindow();
    w.popupOpenFocus(url, "show_schedule", 950, 700, "", false, false);
}
