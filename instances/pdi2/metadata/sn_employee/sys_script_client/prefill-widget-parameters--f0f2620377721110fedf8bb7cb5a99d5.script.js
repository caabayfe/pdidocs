function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    // Prefill the widget parameters with widget's option schema.
    var widget = g_form.getReference('widget', populate);

    function populate(widget) {
        if (g_form.getValue('widget') == g_scratchpad.widget) {
            g_form.setValue('widget_parameters', g_scratchpad.widget_params);
            return;
        }
        var option_schema = widget.option_schema;
        if (!option_schema) {
            g_form.setValue('widget_parameters', "");
            return;
        }
        var ob = {};
        var options = JSON.parse(option_schema);
        for (var i = 0; i < options.length; i++) {
            var name = options[i].name || "";
            var value = options[i].default_value || "";
            ob[name] = value;
        }
        g_form.setValue('widget_parameters', JSON.stringify(ob));
    }

}
