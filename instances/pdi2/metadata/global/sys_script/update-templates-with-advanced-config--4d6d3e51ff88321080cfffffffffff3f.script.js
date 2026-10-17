(function executeRule(current, previous /*null when async*/ ) {
    function setV2() {
        current.v2 = true;
        current.show_on_template_bar = false;
    }

    function checkNoEMail(templateV2Arr) {
        for (var i = 0; i < templateV2Arr.length; i++) {
            var obj = templateV2Arr[i];
            if (obj.hasOwnProperty('update_to') || obj.hasOwnProperty('content_placement')) {
                return false; // Found an invalid key
            }
        }
        return true; // No invalid keys found
    }

    function checkNoCondition(templateV2Arr) {
        for (var i = 0; i < templateV2Arr.length; i++) {
            var obj = templateV2Arr[i];
            if (obj.condition_count !== 0) {
                return false;
            }
        }
        return true;
    }

    function checkNoVar(templateV2Str) {
        var regex = /\$\{([^}]+)\}/;
        return !regex.test(templateV2Str);
    }

    function getTemplateStr(templateV2Arr) {
        var templates = [];

        for (var i = 0; i < templateV2Arr.length; i++) {
            var obj = templateV2Arr[i];
            if (obj.hasOwnProperty('template')) {
                templates.push(obj.template);
            }
        }

        return templates.join('^') + '^EQ';
    }

    try {
        var templateV2 = JSON.parse(current.template_v2);
        if (checkNoEMail(templateV2) &&
            checkNoCondition(templateV2) &&
            checkNoVar(current.template_v2)) {
            if (!current.v2) {
                // Move the data from template_v2 field to template field since advanced features in template_v2 are not getting used
                current.template_v2 = '';
                current.template = getTemplateStr(templateV2);
            } else
                current.template = '';
        } else {
            // Clear template field since template_v2 field has advanced features
            current.template = '';
            setV2();
        }
    } catch (ex) {
        current.template_v2 = '';
    }

    // Template is v2 because of template_condition field
    if (!current.template_condition.nil())
        setV2();

    if (current.v2 && current.template) {
        current.template_v2 = JSON.stringify([{
            "template": current.template.replace(/\^EQ$/, ''),
            "conditions": "",
            "condition_count": 0
        }]);
        current.template = '';
    }

    if (current.changes())
        current.update();

})(current, previous);
