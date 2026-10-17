function onCondition() {
    var nonMandatoryInstallStatus = ['11', '2']; // Retired, Disposed
    var mandatoryfields = g_scratchpad.formMandatoryFields;
    var serialField = 'serial_number';
    var installStatus = g_form.getValue('install_status');
    var sysClassName = g_form.getTableName();
    var originalMandatoryState = false;
    if (mandatoryfields && mandatoryfields[0] && mandatoryfields[1]) {
        var fields = mandatoryfields[0];
        var mandatoryOnLoad = mandatoryfields[1];
        for (var i = 0; i < fields.length; i++) {
            if (fields[i] === serialField && mandatoryOnLoad[i]) {
                originalMandatoryState = true;
                break;
            }
        }
        var shouldEnforce = !nonMandatoryInstallStatus.includes(installStatus);
        for (var i = 0; i < fields.length; i++) {
            if (g_form.hasField(fields[i]) && fields[i] !== serialField) {
                g_form.setMandatory(fields[i], shouldEnforce && mandatoryOnLoad[i]);
            }
        }
    }
    if (g_form.hasField(serialField)) {
        var shouldBeMandatory = originalMandatoryState &&
            !nonMandatoryInstallStatus.includes(installStatus) &&
            sysClassName !== 'alm_consumable' &&
            sysClassName !== 'alm_license';

        g_form.setMandatory(serialField, shouldBeMandatory);
        if (!shouldBeMandatory) {
            g_form.hideFieldMsg(serialField);
        }
    }
    if (g_form.hasField('location')) {
        g_form.setReadOnly('location', false);
    }
    var sections = g_form.getSectionNames();
    var displaySection = true;
    if (sysClassName !== 'alm_license' && sysClassName !== 'alm_consumable') {
        for (var i = 0; i < sections.length; i++) {
            displaySection = true;
            if (sections[i] == 'mobile') {
                if (g_form.getValue('model_category') !== '0be11f58c7432010f74c784c95c260b7') {
                    displaySection = false;
                }
            }
            g_form.setSectionDisplay(sections[i], displaySection);
        }
    }
}
