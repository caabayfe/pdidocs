function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (!isLoading || newValue === '') {
        g_form.setValue('generator', '');
    }

    g_form.getReference('generator_type', showGenerator);

    function showGenerator(generatorType) {
        var isGeneratorRequired = generatorType.use_custom_model == 'true';
        g_form.setMandatory('generator', isGeneratorRequired);
        g_form.setDisplay('generator', isGeneratorRequired);
    }

}
