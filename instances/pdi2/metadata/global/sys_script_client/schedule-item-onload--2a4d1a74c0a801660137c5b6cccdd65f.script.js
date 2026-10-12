function onLoad() {
   // get override status and hide override field
   var override = g_form.getValue('parent') + '';
   if (override != '') {
      showHideElement('repeat_type', false, false);
   }   
   showHideElement('parent', false, false);
   setRepeatText();
}

function setRepeatText() {
   var e = gel("ni." + g_form.tableName + ".repeat_description");
   if (e) {
      var repeatType = g_form.getValue("repeat_type");
      var repeatCount = g_form.getValue("repeat_count");
      var startDateTime = g_form.getValue("start_date_time");
      var daysOfWeek = g_form.getValue("days_of_week");
      var monthlyType = g_form.getValue("monthly_type");
      var yearlyType = g_form.getValue("yearly_type");
      var month = g_form.getValue("month");
      var floatWeek = g_form.getValue("float_week");
      var floatDay = g_form.getValue("float_day");

      if (!startDateTime) {
          startDateTime = "";
      }
      if (!repeatCount) {
          repeatCount = 0;
      }
      var ga = new GlideAjax("TimeSpanScheduler");
      ga.addParam('sysparm_name', 'scheduleTime');
      ga.addParam('sysparm_repeat_type', repeatType);
      ga.addParam('sysparm_repeat_count', repeatCount);
      ga.addParam('sysparm_start_date', startDateTime);
      ga.addParam('sysparm_days_of_week', daysOfWeek);
      ga.addParam('sysparm_monthly_type', monthlyType);
      ga.addParam('sysparm_yearly_type', yearlyType);
      ga.addParam('sysparm_month', month);
      ga.addParam('sysparm_float_week', floatWeek);
      ga.addParam('sysparm_float_day', floatDay);
      ga.addParam('sysparm_schedule_tz', g_scratchpad.scheduleTimezone);
      ga.getXMLAnswer(setRepeatTextResponse, [], e);
   }
}

function setRepeatTextResponse(answer, repeatText) {
   repeatText.innerHTML = answer; 
}

function showHideElement(name, showFlag, mandatoryFlag) {
   g_form.setDisplay(name, showFlag);
   g_form.setMandatory(name, mandatoryFlag);
}
