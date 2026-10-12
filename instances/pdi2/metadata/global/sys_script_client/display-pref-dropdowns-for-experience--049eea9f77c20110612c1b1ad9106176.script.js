function onLoad() {
    g_form.setVisible('experience_display_preferences', false);

    var displayPrefs = g_form.getValue('experience_display_preferences');
    displayPrefs = displayPrefs.split(';') || [];
    var displayPrefsObject = {};
    displayPrefs.forEach(function(pref) {
        var prefKeyValue = pref.split('=');
        displayPrefsObject[prefKeyValue[0]] = prefKeyValue[1];
    });

    var standardMessage = "Show as additional property";
    var allMessage = "Always show";
    var advancedMessage = "Show as additional property for Playbook admins only";
    var translatedMessages = {};
    translatedMessages[standardMessage] = standardMessage;
    translatedMessages[allMessage] = allMessage;
    translatedMessages[advancedMessage] = advancedMessage;
    var keys = [allMessage, standardMessage, advancedMessage];

    // Putting the logic in getMessages ensures that the dropdowns will have the right translations when rendered.
    nowapi.g_i18n.getMessages(keys, function(translations) {
        keys.forEach(function(key) {
            translatedMessages[key] = translations[key];
        });

        // If the page is loaded and the experience inputs are not visible, the label will have no width
        // and the dropdowns will look bad. So use the input label width instead.
        var labelWidth = null;
        var input = g_form.elements.find(function getInputField(element) {
            return element.tableName.startsWith('sys_pd_activity_definition.inputs.') && !element.fieldName.startsWith('inputs.');
        });

        if (input)
            labelWidth = document.getElementById('element.' + input.tableName + '.' + input.fieldName).querySelector('label').clientWidth;

        if (!labelWidth) {
            var experience = g_form.elements.find(function getExperienceField(element) {
                return element.tableName.startsWith('sys_pd_activity_definition.type_vals.') && !element.fieldName.startsWith('type_vals.');
            });

            labelWidth = document.getElementById('element.' + experience.tableName + '.' + experience.fieldName).querySelector('label').clientWidth;
        }

        g_form.elements
            .filter(function getExperienceVarFields(element) {
                return element.tableName.startsWith('sys_pd_activity_definition.type_vals.') && !element.fieldName.startsWith('type_vals.');
            })
            .forEach(function addDesignerViewOptions(element) {
                var fieldSection = document.getElementById('element.' + element.tableName + '.' + element.fieldName);
                var elementId = 'experience-display-preference-' + element.fieldName;

                if (!fieldSection)
                    return;

                var filterInput = fieldSection.querySelector('.filter_controls');
                if (filterInput)
                    filterInput.style.paddingBottom = '27px';

                var filterInputWithOverflow = fieldSection.querySelector('.filter_controls-with-overflow');
                if (filterInputWithOverflow)
                    filterInputWithOverflow.style.paddingBottom = '22px';

                var leftMargin = labelWidth + 14;
                var selected = displayPrefsObject[element.fieldName] || 'advanced';
                var dropdown = '<select id="' + elementId + '" name="experience-display-preference-' + element.fieldName + '" style="position: absolute;bottom:0px;left:' + leftMargin + 'px;">';

                keyMapping = {
                    all: allMessage,
                    standard: standardMessage,
                    advanced: advancedMessage
                };
                for (key in keyMapping) {
                    dropdown += '<option value="' + key + '" ' + (selected === key ? "selected" : "") + '>' + translatedMessages[keyMapping[key]] + '</option>';
                }
                dropdown += '</select>';

                fieldSection.style.position = 'relative';
                fieldSection.style.minHeight = '65px';
                fieldSection.insertAdjacentHTML('beforeend', dropdown);
            });
    });

}
