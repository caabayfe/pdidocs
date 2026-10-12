function onLoad() {
        var ga = new GlideAjax('PADGlideAJAXCallProcessType');
        ga.addParam('sysparm_name', 'getFieldValues');
        ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
        ga.getXML(checkDefaults);

        function checkDefaults(response) {
            var values = response.responseXML.documentElement.getAttribute("answer");
            values = JSON.parse(values);

            Object.keys(values).forEach(function(column) {
                g_form.setValue(column, values[column]);
            });
        }
}
