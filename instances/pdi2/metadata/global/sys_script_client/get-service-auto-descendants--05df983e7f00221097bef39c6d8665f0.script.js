function onLoad() {
    var ga = new GlideAjax('ServiceAutoDescendants'); // Call the Script Include
    ga.addParam('sysparm_name', 'getServiceAutoDescendants'); // Call the function
    ga.getXMLAnswer(function(response) {
        var tableField = g_form.getControl('table');
        if (!tableField) {
            console.error("Field 'table' not found.");
            return;
        }
        var currentVal = g_form.getValue('table');
        tableField.options.length = 0; // Clear existing options
        try {
            var tables = JSON.parse(response);
            tableField.add(new Option('-- Select a Table --', ''));
            for (var i = 0; i < tables.length; i++) {
                tableField.add(new Option(tables[i], tables[i])); // Use name as both text & value
            }
            if (currentVal) {
                g_form.setValue('table', currentVal);
            }
        } catch (error) {
            console.error("JSON Parsing Error:", error);
        }
    });
}
