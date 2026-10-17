function onLoad() {
    var selectedType = g_form.getValue("type");
    g_form.getSectionNames().forEach(function(name) {
        g_form.setSectionDisplay(name, false);
    });
    var actionFields = new Map(Object.entries({
        "boost": [
            ["boost_number", true],
            ["boost_context_field", false],
            ["boost_field_name", false],
            ["boost_number", true],
            ["boost_indexed_source", true]
        ],
        "block": [
            ["block_doc", true]
        ],
        "promote": [
            ["promote_doc", true]
        ]
    }));

    actionFields.forEach(function(fields, name) {
        if (name == selectedType.toLowerCase()) {
            Array.from(fields).forEach(function(field_obj) {
                g_form.setMandatory(field_obj[0], field_obj[1]);
            });
        } else {
            Array.from(fields).forEach(function(field_obj) {
                g_form.setMandatory(field_obj[0], false);
            });
        }
    });

    var targetSection = selectedType.toLowerCase() + "_action";
    g_form.getSectionNames().forEach(function(name) {
        if (name == targetSection) {
            g_form.setSectionDisplay(name, true);
        }
    });
}
