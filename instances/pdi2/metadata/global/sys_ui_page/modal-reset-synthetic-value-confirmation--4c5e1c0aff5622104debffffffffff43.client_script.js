function resetSyntheticValues() {
    const ga = new GlideAjax("ResetSyntheticValueUtilCore");
    ga.addParam("sysparm_name", "resetToDefault");
    ga.addParam("sysparm_data_pattern_sys_id", g_form.getUniqueValue());
    ga.getXMLAnswer(resetSyntheticValuesHandler);
}

function resetSyntheticValuesHandler(response) {
    document.getElementById("modal_reset_synthetic_value_confirmation_closemodal").click();
    const res = JSON.parse(response);
    if (res.isError) {
        g_form.addErrorMessage(res.message);
        return;
    }
    g_form.setValue('synthetic_value', res.defaultSyntheticValue);
    g_form.addInfoMessage(res.message);
}
