function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var hideEmploymentGapFields = ["employment_type", "employer_name", "address", "city", "state", "country", "zip"];
    var hideEmployementFields = ["gap_reason"];

    if (g_form.getValue("employment_history_type") === "employment_gap") {
        hideEmploymentGapFields.forEach(function(field) {
            g_form.setDisplay(field, false);
        });

        hideEmployementFields.forEach(function(field) {
            g_form.setDisplay(field, true);
        });

    } else if (g_form.getValue("employment_history_type") === "employment") {

        hideEmployementFields.forEach(function(field) {
            g_form.setDisplay(field, false);
        });

        hideEmploymentGapFields.forEach(function(field) {
            g_form.setDisplay(field, true);
        });

    } else {
        hideEmploymentGapFields.forEach(function(field) {
            g_form.setDisplay(field, true);
        });

        hideEmployementFields.forEach(function(field) {
            g_form.setDisplay(field, true);
        });

    }   
}
