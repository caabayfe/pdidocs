function transform(data) {
    if (!trusted()) return;

    var result = {
        available: {
            task: {}
        },
        selected: [],
        ruleId: null,
        row_rule: false,
        field_rule: false,
    };

    var gr = new GlideRecordSecure('sys_user_role');
    gr.orderBy('name');
    gr.query();

    while (gr.next()) {
        let sys_id = gr.getValue('sys_id');
        result.available.task[sys_id] = {
            id: sys_id,
            label: gr.getValue('name')
        };
    }

    var rule = getRule();
    var warnings = addWarnings();
    result.row_rule = warnings.row_rule;
    result.field_rule = warnings.field_rule;

    if (!rule) return result;

    result.ruleId = rule;
    var selectedRoles = [];

    var gr2 = new GlideRecordSecure('sys_security_acl_role');
    gr2.addQuery('sys_security_acl', rule);
    gr2.orderBy('sys_user_role.name');
    gr2.query();

    while (gr2.next()) {
        let roleId = gr2.getValue('sys_user_role');
        if (result.available.task[roleId]) {
            selectedRoles.push(result.available.task[roleId]);
        }
    }

    result.selected = selectedRoles.map(item => [{
        id: item.id,
        label: item.label
    }]);
    return result;

    function getRule() {
        var aclName = `${data.table}.${data.field}`;
        var gr = new GlideRecordSecure('sys_security_acl');

        gr.addQuery('name', aclName);
        gr.addQuery('operation', data.operation);
        gr.addQuery('description', 'System Generated Rule');
        gr.query();

        if (!gr.next()) {
            gr = new GlideRecordSecure('sys_security_acl');
            gr.addQuery('name', aclName);
            gr.addQuery('operation', data.operation);
            gr.query();

            if (gr.next() && gr.script.nil() && gr.condition.nil() && gr.getRowCount() === 1) {
                return gr.getValue('sys_id');
            }
            return null;
        }
        return gr.getValue('sys_id');
    }

    function addWarnings() {
        var row_rule = false;
        var gr = new GlideRecordSecure('sys_security_acl');
        gr.addQuery('name', data.table);
        gr.addQuery('operation', data.operation);
        gr.query();
        if (gr.next()) {
            row_rule = true;
        }
        var field_rule = false;
        gr = new GlideRecordSecure('sys_security_acl');
        gr.addQuery('name', data.table + '.' + data.field);
        gr.addQuery('operation', data.operation);
        gr.query();
        while (gr.next()) {
            if (gr.description != 'System Generated Rule' && !(gr.script.nil() && gr.condition.nil() && gr.getRowCount() === 1))
                field_rule = true;
        }
        return {
            row_rule,
            field_rule
        };
    }

    function trusted() {
        return gs.hasRole('admin');
    }
}
