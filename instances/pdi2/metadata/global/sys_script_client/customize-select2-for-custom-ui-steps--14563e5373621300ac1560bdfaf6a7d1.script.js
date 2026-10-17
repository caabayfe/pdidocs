function onLoad() {

    // mapping of Custom UI step config ids to their input variables that are scripted choices
    var customUIInputVars = {
        // Click component
        'def25c4b73730300c79260bdfaf6a700': ['component'],
        // Component state validation
        '38907e937322130007d738682bf6a742': ['component']
    };

    var stepConfig = g_form.getValue('step_config');
    var inputVarChoices = customUIInputVars[stepConfig];
    var isComponentStateValidationStep = '38907e937322130007d738682bf6a742' === stepConfig;
    var use_label_path = (g_scratchpad.use_label_path === 'true');

    // check if this is a Custom UI step with a scripted choice input variable
    if (typeof inputVarChoices == 'undefined')
        return;

    var inputVar = inputVarChoices[0];
    var fieldId = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.' + inputVar;
    var selectedChoice = g_form.getValue(fieldId);
    var selectElem = g_form.getControl(fieldId);
    if (!selectElem)
        return;

    // This is a hack to replace the 'select' tag with a hidden 'input' tag.
    // Necessary because of a bug with select2 where 'data' doesn't work with select tags
    // See: https://github.com/select2/select2/issues/3867 (Fixed in version 4.0 but we use 3.5.1)
    var inputElem = document.createElement('input');
    inputElem.setAttribute('type', 'hidden');
    var attrsToCopy = selectElem.attributes;
    for (var i = 0; i < attrsToCopy.length; i += 1) {
        var attr = attrsToCopy[i];
        inputElem.setAttribute(attr.nodeName, attr.nodeValue);
    }

    selectElem.parentNode.replaceChild(inputElem, selectElem);

    var ga = new GlideAjax('ATFSnapshotHelper');
    ga.addParam('sysparm_name', 'getComponentsFromSnapshot');
    ga.addParam('sysparm_test_id', g_form.getValue('test'));
    ga.addParam('sysparm_step_order', g_form.getValue('order'));
    if (stepConfig === 'def25c4b73730300c79260bdfaf6a700')
        ga.addParam('sysparm_methods', 'click');

    ga.getXMLWait();
    var answer = JSON.parse(ga.getAnswer());

    if (!answer) {
        answer = {
            results: []
        };
        if (selectedChoice)
            answer['results'].push({
                id: selectedChoice,
                text: '',
                tag: ''
            });
    }

    // If the result contains at least one component determine whether versions should be shown
    var showVersions = false;
    if (answer.results.length > 0 && answer.results[0].children)
        showVersions = shouldShowVersions(answer.results[0].children);

    _addStyleClasses();

    var MESSAGE_KEY_SELECT_COMPONENT = 'ATF_CUSTOM_UI:Select a UI component';
    var MESSAGE_KEY_LABEL = "ATF_CUSTOM_UI:Label";
    var MESSAGE_KEY_TYPE = "ATF_CUSTOM_UI:Type";
    var MESSAGE_KEY_PAGE_AREA = "ATF_CUSTOM_UI:Page area";
    var MESSAGE_KEY_ENABLED = "ATF_CUSTOM_UI:Enabled";
    var MESSAGE_KEY_NO_MATCHES_FOUND = "ATF_CUSTOM_UI:No matches found";
    var MESSAGE_KEY_VERSION_TITLETEXT = "ATF_CUSTOM_UI:VERSION_TITLETEXT";
    var MESSAGE_KEY_LABEL_PATH = "ATF_CUSTOM_UI:Label Path";
    var MESSAGE_KEY_DUPLICATE_INDEX_TITLETEXT = "ATF_CUSTOM_UI:DUPLICATE_INDEX_TITLETEXT";
    var MESSAGE_KEY_EMPTY = "(empty)";
    var MESSAGE_KEY_LABEL_PATH_2_PARAMS = "ATF_CUSTOM_UI:{0} > {1}";
    var MESSAGE_KEY_LABEL_PATH_3_PARAMS = "ATF_CUSTOM_UI:{0} > {1} > {2}";

    var map = new GwtMessage().getMessages([MESSAGE_KEY_SELECT_COMPONENT, MESSAGE_KEY_LABEL,
        MESSAGE_KEY_TYPE, MESSAGE_KEY_PAGE_AREA, MESSAGE_KEY_NO_MATCHES_FOUND, MESSAGE_KEY_ENABLED,
        MESSAGE_KEY_VERSION_TITLETEXT, MESSAGE_KEY_DUPLICATE_INDEX_TITLETEXT, MESSAGE_KEY_EMPTY,
        MESSAGE_KEY_LABEL_PATH, MESSAGE_KEY_LABEL_PATH_2_PARAMS, MESSAGE_KEY_LABEL_PATH_3_PARAMS
    ]);

    $j(inputElem).select2({
        placeholder: map[MESSAGE_KEY_SELECT_COMPONENT],
        data: {
            results: answer['results'],
            text: function(item) {
                return item.text + ' ' + item.component_id + ' ' + item.tag + ' ' + item.area +
                    ' ' + item.sn_atf_mugshot_label + ' ' + item.sn_atf_mugshot_value + ' ' +
                    item.sn_atf_mugshot_tag_display_name + ' ' + item.sn_atf_mugshot_long_description +
                    ' ' + getAttrFromMugshot('sn-atf-id', item);
            }
        },
        matcher: matchCustom,
        formatSelection: formatSelection,
        formatResult: formatResult
    }).val(selectedChoice);

    // set the previously selected value and trigger a change event to force the select2 to call formatSelection
    $j(inputElem).trigger('change');

    function matchCustom(userQuery, item) {
        if (!item)
            return false;

        // user didn't type anything, so every option should match (This should never happen though. This only gets called when the user types something)
        if (!userQuery)
            return true;

        item = item.toLowerCase();
        userQuery = userQuery.toLowerCase();

        return item.indexOf(userQuery) != -1;
    }

    _addStyleClasses();

    function formatResult(option) {
        // if there's a children attribute, this is an optgroup
        if (option.children) {
            if (option.children.length === 0)
                return getNoMatchDiv(); // if there are no children the select2 should display "No matches found"

            return getHeaderMarkup();
        }

        var label = escapeHTMLUnsafeText(option.sn_atf_mugshot_label) || map[MESSAGE_KEY_EMPTY];
        var type = escapeHTMLUnsafeText(option.sn_atf_mugshot_tag_display_name);

        return getRowMarkup(type, label, getTitleText(option), option);
    }

    // Returns a div that displays the message "No matches found" along with a style tag that makes the div mimic the
    // built-in no match div showed by select2
    function getNoMatchDiv() {
        return "<div class='atf-no-result'><span>" + map[MESSAGE_KEY_NO_MATCHES_FOUND] + "</span></div>" +
            "<style>" +
            "li.select2-result .select2-result-label { " +
            "padding: 0; margin: 0; cursor: pointer; min-height: auto;" +
            "user-select: none; background-color: #fff; border: none;" +
            "} " +
            "div.select2-result-label { height: 28px !important; } " +
            "div.select2-result-label span { cursor: text; } " +
            ".atf-no-result { margin: 10px 0 10px 0; text-align: center; }" +
            "</style>";
    }

    function isEnabled(component) {
        return !JSON.parse(component.locator)["isDisabled"];
    }

    function getHeaderMarkup() {
        var headerMarkup = "<div class='atf-select-2-row-container atf-select-2-header-row'>";
        if (isComponentStateValidationStep) {
            headerMarkup += "<span class='atf-select-2-header' style='width: 23.5%; padding-left: 13px;'>" + map[MESSAGE_KEY_TYPE] + "</span>";
            headerMarkup += getSelect2HeaderMarkup(28, map[MESSAGE_KEY_LABEL]);
            headerMarkup += getSelect2HeaderMarkup(10, map[MESSAGE_KEY_ENABLED]);
            headerMarkup += getSelect2HeaderMarkup(38.5, map[MESSAGE_KEY_PAGE_AREA]);
        } else {
            headerMarkup += "<span class='atf-select-2-header' style='width: 26%; padding-left: 13px;'>" + map[MESSAGE_KEY_TYPE] + "</span>";
            headerMarkup += getSelect2HeaderMarkup(35, map[MESSAGE_KEY_LABEL]);
            headerMarkup += getSelect2HeaderMarkup(39, map[MESSAGE_KEY_PAGE_AREA]);
        }

        headerMarkup += "</div>";
        return headerMarkup;
    }

    function getRowMarkup(type, label, titleText, option) {
        var markup = "<div class='atf-select-2-row-container' data-container='#select2-drop' data-toggle='tooltip' data-placement='bottom' title='" + titleText + "'>";
        var labelPath = null;
        if (option.label_path)
            labelPath = getLabelPath(option.label_path);

        if (isComponentStateValidationStep) {
            markup += getSelect2ItemMarkup(22, type);
            markup += getSelect2ItemMarkup(29, label);
            markup += getSelect2ItemMarkup(10, isEnabled(option));
            // If use_label_path property is set and labelPath is not null/undefined and pageArea is default, display labelPath
            if (use_label_path && labelPath && option.area === 'default')
                markup += getSelect2ItemMarkup(39, labelPath);
            else
                markup += getSelect2ItemMarkup(39, option.area);
        } else {
            markup += getSelect2ItemMarkup(25, type);
            markup += getSelect2ItemMarkup(35.5, label);
            // If use_label_path property is set and labelPath is not null/undefined and pageArea is default, display labelPath
            if (use_label_path && labelPath && option.area === 'default')
                markup += getSelect2ItemMarkup(39.5, labelPath);
            else
                markup += getSelect2ItemMarkup(39.5, option.area);
        }

        // Add an sr-only span at the end so the title-text is accessible
        markup += "<span class='sr-only'>" + titleText + "</span>";

        markup += "</div>";
        return markup;
    }

    function getSelect2ItemMarkup(width, text) {
        return "<span class='atf-select-2-item' style='width: " + width + "%;'>" + text + "</span>";
    }

    function getSelect2HeaderMarkup(width, text) {
        return "<span class='atf-select-2-header' style='width: " + width + "%;'>" + text + "</span>";
    }

    /**
     * Similar to formatResult, but with a few key differences.
     * - No need to format optgroups because they aren't selectable
     * - Set data-container to body so the tooltips show correctly
     * - Set height of the select2 to 30px so the bottom doesn't get cut off
     */
    function formatSelection(option, selectElem) {
        // if there are any lingering tooltips when the select2 closes, hide them
        $j(".tooltip").tooltip("hide");

        // For some reason 'display: inline-block;' sets the height to 41, so set it back to 30...
        if (selectElem && selectElem[0])
            selectElem[0].setAttribute('style', 'height: 30px;');

        //replace single quotes with double quotes and escape HTML
        var shortDescription = escapeHTMLUnsafeText(option.sn_atf_mugshot_short_description);

        var titleText = getTitleText(option);

        return "<div title='" + titleText + "' data-toggle='tooltip' data-placement='bottom' data-container='body' " +
            "class='atf-select-2-display-value atf-select-2-item' aria-label='" + titleText + "'>" + shortDescription + "</div>";
    }

    function escapeHTMLUnsafeText(text) {
        if (!text)
            return text;

        // escape quotes as they break the markup, any other HTML-sensitive characters and trim leading whitespace
        return text.replace(/'/g, '"').escapeHTML().trim();
    }

    /**
     * Generates title text for the specified select2 option
     * It consists of long description, and possibly duplicate-mugshot-index and version depending on the context
     */
    function getTitleText(option) {
        var result = escapeHTMLUnsafeText(option.sn_atf_mugshot_long_description);
        var snAtfId = getAttrFromMugshot("sn-atf-id", option);
        if (snAtfId)
            result += " (" + snAtfId + ")";

        // Show duplicate index if there is one, but convert it to 1-based instead of 0-based first
        if (option["duplicate-mugshot-index"]) {
            var index = parseInt(option["duplicate-mugshot-index"]) + 1;
            result += "\n" + formatMessage(map[MESSAGE_KEY_DUPLICATE_INDEX_TITLETEXT], index);
        }

        if (showVersions)
            result += "\n" + formatMessage(map[MESSAGE_KEY_VERSION_TITLETEXT], option.version);

        if (use_label_path && option.label_path)
            result += "\n" + formatMessage(map[MESSAGE_KEY_LABEL_PATH], getLabelPath(option.label_path));

        return result;
    }

    function _addStyleClasses() {
        var headerStyle = document.createElement('style');
        headerStyle.innerText =
            ".atf-select-2-display-value { line-height: 30px; }" +
            ".atf-select-2-item { text-align: left;display: inline-block;text-align: left;" +
            "overflow: hidden;text-overflow: ellipsis;white-space: nowrap; width: 100%;}" +
            "li.select2-result-unselectable div.select2-result-label { height: 40px; cursor: default; }" +
            "li.select2-result-selectable div.select2-result-label, .atf-select-2-header { display: inline-block;" +
            "height: 30px; cursor: pointer; padding-top: 6px; }" +
            "div.select2-result-label { background-color: #fafafa; border: 1px solid #e6e8ea; height: 30px; width: 100%; }" +
            "ul.select2-result-sub div.select2-result-label { background-color: transparent; border: 0px; }";

        document.body.appendChild(headerStyle);
    }

    /**
     * Determine whether versions should be shown for the specified array of components
     * Only show versions if there's at least 2 different versions represented in the set
     */
    function shouldShowVersions(components) {
        // Need at least 2 components before there's even a reason to show versions
        if (components.length > 1) {
            // Expect all components to have the same version -- use component 0's version as the expectation
            var expectedVersion = components[0].version;

            // Check other components starting from 1
            for (var i = 1; i < components.length; i++) {
                // Found a component that doesn't match so versions should be shown
                if (components[i].version !== expectedVersion)
                    return true;
            }
        }

        return false;
    }

    function getAttrFromMugshot(attr, item) {
        if (!item || !item.locator)
            return '';

        try {
            var mugshot = JSON.parse(item.locator);
            return escapeHTMLUnsafeText(mugshot[attr]) || '';
        } catch (e) {
            console.error("Error parsing mugshot:", e);
            return '';
        }
    }

    /**
     * Converts the labelPath JSON object to labelPath String
     * @param labelPath: JSON object of labelPath
     * Structure of the labelPath {"label_path": ["label1", "label2", "label3", ...]}
     * @returns last 3 elements of labelPath array in String format "label1>label2>label3"
     */
    function getLabelPath(labelPath) {
        var labelPathString = null;
        var labelPathJSON = labelPath;
        if (labelPathJSON) {
            var labelPathArray = JSON.parse(JSON.parse(labelPathJSON).label_path);
            if (labelPathArray) {
                if (labelPathArray.length === 1)
                    labelPathString = labelPathArray.join();
                else if (labelPathArray.length === 2)
                    labelPathString = formatMessage(map[MESSAGE_KEY_LABEL_PATH_2_PARAMS], [labelPathArray[0], labelPathArray[1]]);
                else
                    labelPathString = formatMessage(map[MESSAGE_KEY_LABEL_PATH_3_PARAMS], [labelPathArray[labelPathArray.length - 3], labelPathArray[labelPathArray.length - 2], labelPathArray[labelPathArray.length - 1]]);

            }
        }
        return labelPathString;
    }

}
