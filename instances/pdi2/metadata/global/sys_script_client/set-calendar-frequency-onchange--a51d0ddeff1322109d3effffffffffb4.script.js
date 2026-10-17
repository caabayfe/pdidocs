
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearOptions('pa_datasnapshot_indicator.calendar_freq');
    var currentTableSelected = g_form.getValue("data_snapshot_source");
    var currentCalendarSelected = g_form.getValue("calendar");
    if (currentCalendarSelected == 'standard') {
        g_form.setMandatory('calendar_freq', false);
        g_form.setDisplay('calendar_freq', false);
        g_form.setDisplay('frequency', true);
    } else {
        g_form.setDisplay('calendar_freq', true);
        g_form.setMandatory('calendar_freq', true);
        g_form.setDisplay('frequency', false);
    }
    var ga = new GlideAjax('PAKPIFormUtils');
    ga.addParam("sysparm_name", "getBusinessCalendarBasedOnTZ");
    ga.addParam('sysparm_source_id', currentTableSelected);
    ga.addParam('sysparm_calendar_group', currentCalendarSelected);
    ga.getXML(handleTableSelection);

    function handleTableSelection(response) {
        var answer = response;
        var result = response.responseXML.getElementsByTagName("result");
         if (result && result.length > 0) {
            var recordsString = result[0].getAttribute("record");
            var records = JSON.parse(recordsString);
            for (var i = 0; i < records.length; i++) {
                if (!records[i].key == '')
                    g_form.addOption('pa_datasnapshot_indicator.calendar_freq', records[i].key, records[i].value);
            }
        }
    }
}
