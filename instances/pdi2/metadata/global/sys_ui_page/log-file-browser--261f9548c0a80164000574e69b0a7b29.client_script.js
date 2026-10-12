addLoadEvent(select_level);

function submitLogBrowse() {
   $("submit_buttons").hide();
   var output = $("logOutput");
   if (output)
      output.hide();
   $("logWait").show();
   $("form.${sys_id}").submit();
}

function secsBack(secs) {
	var e = $("end_time");
	var dt = new GwtDate();
	dt.now();
	e.value = dt.formatDate(g_user_date_time_format);
	dt.subtractSeconds(secs);
	var s = $("start_time");
	s.value = dt.formatDate(g_user_date_time_format);
	submitLogBrowse();
}

function select_level() {
   var hidden_field = gel("match_level");
   var hidden_value = hidden_field.value;
   var select_field = gel("level");
   if (hidden_value != '') {
      for (var i=0; i < select_field.length; i++) {
         if (select_field.options[i].value == hidden_value) {
             select_field.options[i].selected = true;
         }
         else
             select_field.options[i].selected = false;
      }
   }
}

function remember_select_level(selector) {
   var hidden_field = gel("match_level");
   hidden_field.value = selector.options[selector.selectedIndex].value;
}
