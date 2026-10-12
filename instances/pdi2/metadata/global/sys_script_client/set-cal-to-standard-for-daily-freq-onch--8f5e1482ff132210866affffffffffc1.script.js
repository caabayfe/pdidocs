function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
     var sourceId = g_form.getValue("analytics_source");

    var ga = new GlideAjax('PAKPIFormUtils');
    ga.addParam("sysparm_name", "isDailyFrequency");
    ga.addParam("sysparm_source_id", sourceId);
    ga.getXML(handleCalendarOptions);


    function handleCalendarOptions(response) {
        var result = response.responseXML.getElementsByTagName("result");
        var isDaily = result[0].getAttribute("is_daily");

        if (isDaily === "true") {
            // Set calendar to Standard and make it read-only
            g_form.setValue("calendar", "standard");
            g_form.setReadOnly("calendar", true);
        } else {
            // Allow user to select other calendars
            g_form.setReadOnly("calendar", false);
        }
    }


}
