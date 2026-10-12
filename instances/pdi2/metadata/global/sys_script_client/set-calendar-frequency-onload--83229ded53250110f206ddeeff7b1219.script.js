function onLoad() {
    var currentTableSelected = g_form.getValue("analytics_source");
    var currentCalendarSelected = g_form.getValue("calendar");
    var selected = document.getElementById("pa_dm_kpi_configuration.calendar_freq").value;
    g_form.clearOptions('pa_dm_kpi_configuration.calendar_freq');

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
            var k = 0;
            for (var i = 0, j = 0; i < records.length; i++) {
                if (!records[i].key == '') {
                    var index = selected.indexOf(records[i].key);
                    if (index > -1) {
                        g_form.setValue('pa_dm_kpi_configuration.calendar_freq', records[i].key, records[i].value);
                        j++;
                    } else {
                        var opt = new Option(records[i].value, records[i].key);
                        g_form.addOption('pa_dm_kpi_configuration.calendar_freq', records[i].key, records[i].value);
                        k++;
                    }
                }
            }
        }
    }
}
