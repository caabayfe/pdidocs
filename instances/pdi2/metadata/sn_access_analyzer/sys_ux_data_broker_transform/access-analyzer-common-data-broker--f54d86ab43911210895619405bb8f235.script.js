function transform(input) {

    const payload = input.payload;
    if (!payload || !payload.action)
        return;

    const func = {};

    func.getSysUserFields = () => {
        var gr = new GlideRecord("sys_dictionary");
        gr.addEncodedQuery("name=sys_user^active=true^internal_type!=collection^NQname=sys_user^active=true^internal_typeISNULL");
        gr.query();
        var resp = {};
        while (gr.next()) {
            var name = gr.element.getValue();
            if (gs.hasRightsTo('record/sys_user.' + name + '/read', null)) {
                resp[name] = gr.column_label.getDisplayValue();
            }
        }
        return resp;
    };

    func.sysUserHasRole = () => {
        if (payload.roleList.length === 0) {
            return false;
        }

        let hasRoleGA = new GlideAggregate("sys_user_has_role");
        hasRoleGA.addAggregate("COUNT");
        hasRoleGA.addQuery("user", "IN", [payload.baseUserId, payload.modelUserId]);
        hasRoleGA.addQuery("role", "IN", payload.roleList);
        hasRoleGA.query();
        hasRoleGA.next();
        return hasRoleGA.getAggregate("COUNT") > 0;
    };

    return {
        request: payload,
        response: func[payload.action]()
    };

}
