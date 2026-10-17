function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue("type") != "record")
        return;

    if ($$('input[id="sys_readonly.sys_security_acl.name"]').length > 0)
        return;
    if (isLoading) {
        // this only captures change of table select, so observe change of field select
        $($$('select[id="ni_fn_sys_security_acl.name"]')[0]).observe('change', function() {
            toggleScript(false);
        }.bind(this));
        if (!g_form.newRecord)
            return;
    }
    toggleScript(!isLoading);
}

function toggleScript(deferConditionDisable) {
    var name = g_form.getValue("name");
    if (!name || name.length == 0) {
        g_form.setReadOnly("condition", false);
        return;
    }
    var names = name !== null ? name.split(".") : [];
    var nameParts = names.length;
    var tableName = nameParts > 0 ? names[0] : "";
    var fieldName = "";
    if (nameParts > 1) {
        for (var i = 1; i < nameParts; i++) {
            if (i == 1)
                fieldName += names[i];
            else
                fieldName += "." + names[i];
        }
    }
    var script = g_form.getValue("script");
    if (script && script.trim().length > 0)
        g_form.acl_script = script;

    if (!isTableInScope(tableName)) {
        g_form.setValue("script", "");
        g_form.setReadOnly("script", true);
        if (deferConditionDisable) {
            var elem = $$('tbody[id="sys_security_acl.conditiongcond_filters"]')[0];
            var handler = function(e) {
                g_form.setReadOnly("condition", fieldName.length == 0);
                $(elem).stopObserving("glide:filter.create.condition_filter", handler);
            };
            $(elem).observe("glide:filter.create.condition_filter", handler);
        } else {
            if (fieldName.length == 0)
                createCondFilter(tableName + ".sys_security_acl.condition", "", "sys_security_acl.condition");
            g_form.setReadOnly("condition", fieldName.length == 0);
        }
    } else {
        g_form.setReadOnly("script", false);
        if (g_form.acl_script)
            g_form.setValue("script", g_form.acl_script);
    }
}

function isTableInScope(tableName) {
    if (tableName === "")
        return true;

    if (tableName == "*" && g_scratchpad.isGlobalScope)
        return true;

    if (g_scratchpad.isScopedAdmin)
        return true;

    var allowedTables = g_scratchpad.inScopeTableList;
    for (var i = 0; i < allowedTables.length; i++) {
        if (allowedTables[i] == tableName) {
            return true;
        }
    }
    return false;
}
