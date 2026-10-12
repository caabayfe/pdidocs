function onLoad() {
            if (g_form.getValue('state') == 'new') {
                g_form.addInfoMessage(getMessage('Delete Data Message'));
            }

            var condition = g_form.getValue("condition");
            if (condition && (condition.indexOf("javascript:") !== -1 || condition.indexOf("DYNAMIC") !== -1)) {
                g_form.showFieldMsg("condition", getMessage("dm.dynamic_value_warning"), "warning");
            }
    }
