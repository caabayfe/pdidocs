function onLoad() {
    var retentionOverride = 'data_retention_period_override';
    // hide at first so we don't see it and then have it go away
    g_form.setDisplay(retentionOverride, false);
	var defaultValueSet = false; // Flag to prevent setting default value twice
    var isAdmin = g_user.hasRole('playbook.admin');
	handleDataRetentionOverride(isAdmin);

    function handleDataRetentionOverride(isAdmin) {
        // if the user is an admin we want to show them the option to override the data retention period
        if (isAdmin && isAdmin !== 'false') {

            var dataRetentionPeriodOverride = g_form.getValue(retentionOverride);
            var periodMatchesPlaybookType = false;
            var playbookTypeId = g_form.getValue('process_type');
            var playbookTypeGr = new GlideRecord('sys_pd_process_type');
            var playbookTypeRetentionPeriod = null;

            if (playbookTypeGr.get(playbookTypeId)) {
                playbookTypeRetentionPeriod = playbookTypeGr.getValue('data_retention_period');

                if (!dataRetentionPeriodOverride && !defaultValueSet) {
                    // if the value of the override is null, we want to set it to the value of the playbook type's retention period;
                    g_form.setValue(retentionOverride, playbookTypeRetentionPeriod);
                    defaultValueSet = true; // Mark that we've set the default value
                    dataRetentionPeriodOverride = playbookTypeRetentionPeriod; // Update local variable to reflect the change
                }

                periodMatchesPlaybookType = playbookTypeRetentionPeriod === dataRetentionPeriodOverride;
            }

            // insert a checkbox into the form. if checked we will show the data_retention_period_override form field
            var parentElement = document.getElementById('element.sys_pd_process_definition.data_retention_period_override');
            var parentParentElement = parentElement.parentNode;
            if (parentElement) {
                var div = document.createElement('div');
                div.classList = 'input-group-checkbox form-group';
                div.style.marginTop = '12px';

                var label = document.createElement('label');
                label.htmlFor = 'showOverride';
                getMessage('Override playbook type data retention period', function(msg) {
                    label.textContent = msg;
                });

                var checkboxInput = document.createElement('input');
                checkboxInput.id = 'showOverride';
                checkboxInput.type = 'checkbox';
                checkboxInput.style.marginLeft = '4px';
                checkboxInput.style.marginTop = '-2px';
                checkboxInput.checked = !periodMatchesPlaybookType;
                checkboxInput.ariaDisabled = g_form.isReadOnly(retentionOverride);
                checkboxInput.onchange = function(event) {
                    handleCheckboxChange(event.target.checked, playbookTypeRetentionPeriod);
                };

                div.append(label);
                div.append(checkboxInput);

                parentParentElement.insertBefore(div, parentElement);
            }

            g_form.setDisplay(retentionOverride, !periodMatchesPlaybookType);
        }
    }

    function handleCheckboxChange(isChecked, defaultPeriod) {
        var control = g_form.getControl(retentionOverride);
        var fieldGE = g_form.getGlideUIElement(retentionOverride);
        if (g_form.isReadOnly(fieldGE, control))
            return;

        if (isChecked) {
            g_form.setDisplay(retentionOverride, true);
        } else {
            g_form.setDisplay(retentionOverride, false);
            g_form.setValue(retentionOverride, defaultPeriod);
        }
    }
}
