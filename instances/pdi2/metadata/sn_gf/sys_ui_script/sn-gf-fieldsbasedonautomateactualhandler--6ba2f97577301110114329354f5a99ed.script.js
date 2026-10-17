var sn_gf = sn_gf || {};

sn_gf.FieldsBasedOnAutomateActualHandler = (function() {
    "use strict";

    return {
        setTargetFields: function(readOnly) {
            if (g_form.getValue("check_in_frequency") == '')
                g_form.setReadOnly("actual_value", readOnly);
            g_form.setMandatory("check_in_frequency", readOnly);
            if (readOnly || g_form.getValue("actual_value")) {
                g_form.setMandatory("base_value", true);
                g_form.setMandatory("target_value", true);
                g_form.setMandatory("measure", true);
            } else {
                g_form.setMandatory("measure", !!(g_form.getValue("base_value") || g_form.getValue("target_value")));
                g_form.setMandatory("base_value", false);
                if (g_form.getValue("check_in_frequency") == '')
                    g_form.setMandatory("target_value", false);
            }
        },
        type: "FieldsBasedOnAutomateActualHandler"
    };
})();
