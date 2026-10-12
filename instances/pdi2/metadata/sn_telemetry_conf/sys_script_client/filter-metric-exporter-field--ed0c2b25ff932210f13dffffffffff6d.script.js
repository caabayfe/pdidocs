function onChange(control, oldValue, newValue, isLoading) {
    // Don't run this script when the form is first loaded
    if (isLoading || newValue === '') {
        return;
    }

    g_form.clearMessages();
    var exporters = g_form.getValue('exporters');

    // If no exporters are selected, nothing to do
    if (!exporters) {
        return;
    }

    // Call the script includes to validate exporters
    var ga = new GlideAjax('TelemetryExporterValidator');
    ga.addParam('sysparm_name', 'getValidExporters');
    ga.addParam('sysparm_metric_type', newValue);
    ga.addParam('sysparm_exporter_list', exporters);
    ga.getXML(filterExporters);

    function filterExporters(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");

        if (!answer) {
            return;
        }

        try {
            var result = JSON.parse(answer);

            // If there are invalid exporters, update the field with only valid ones
            if (result.invalid && result.invalid.length > 0) {
                if (result.valid && result.valid.length > 0) {
                    // Set only the valid exporters
                    g_form.setValue('exporters', result.valid.join(','));

                    // Show a notification that some exporters were removed
                    var msg = new GwtMessage().getMessage("Removed {0} incompatible exporter(s) that do not support the selected metric type.", result.invalid.length);
                    g_form.addInfoMessage(msg);

                } else {
                    // No valid exporters, clear the field
                    g_form.clearValue('exporters');
                    g_form.addInfoMessage(new GwtMessage().getMessage('All selected exporters are incompatible with the selected metric type and were removed.'));
                }
            }
            // If all exporters are valid, no action needed
        } catch (e) {
            console.error('Error processing exporter validation: ' + e);
        }
    }
}
