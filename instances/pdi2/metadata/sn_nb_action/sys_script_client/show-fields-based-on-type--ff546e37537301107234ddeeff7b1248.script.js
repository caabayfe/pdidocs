function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var currentTrendType = newValue;

    var trendTypeSections = ["common_field", "common_reference", "common_condition"];
    var trendTypeSectionMap = {
        "group_by_value": "common_field",
        "group_by_reference": "common_reference",
        "common_condition": "common_condition"
    };

    var sectionFields = ["common_value_field", "reference_table", "input_field", "common_reference_field", "condition_builder"];
    var sectionFieldMap = {
        "common_field": ["common_value_field"],
        "common_reference": ["reference_table", "input_field", "common_reference_field"],
        "common_condition": ["condition_builder"]
    };

    var currentSection = trendTypeSectionMap[currentTrendType];
    var currentSectionFields = sectionFieldMap[currentSection] || [];

    for (var idx = 0; idx < sectionFields.length; idx++) {
        var field = sectionFields[idx];
        var show = currentSectionFields.indexOf(field) != -1;
        g_form.setMandatory(field, show);
    }

    for (idx = 0; idx < trendTypeSections.length; idx++) {
        var section = trendTypeSections[idx];
        show = (section == currentSection);
        g_form.setSectionDisplay(section, show);
    }
}
