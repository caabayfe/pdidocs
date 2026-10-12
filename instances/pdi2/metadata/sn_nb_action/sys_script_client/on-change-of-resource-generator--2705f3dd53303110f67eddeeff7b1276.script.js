function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    g_form.getReference('resource_generator', hideFields);

    function hideFields(resourceGenerator) {
        if (resourceGenerator.getValue("generator_type") == "476f19bd53143110f67eddeeff7b1209") {
            g_form.setMandatory("action", false);
            g_form.setMandatory("action_type", false);
            g_form.setMandatory("recommendation_hint", false);
            g_form.setDisplay("action", false);
            g_form.setDisplay("action_type", false);
            g_form.setDisplay("recommendation_hint", false);
            g_form.setSectionDisplay("action_inputs", false);
        } else {
            g_form.setMandatory("action", true);
            g_form.setMandatory("action_type", true);
            g_form.setMandatory("recommendation_hint", true);
            g_form.setDisplay("recommendation_hint", true);
            g_form.setDisplay("action", true);
            g_form.setDisplay("action_type", true);
            if (g_form.getValue('action_type') !== 'a06a95bbeb2310106fd0b6302a522851') //ensure action inputs is not shown for decision tree
                g_form.setSectionDisplay("action_inputs", true);


        }
    }

}
