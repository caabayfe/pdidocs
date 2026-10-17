function transform(input) {
    var user_id = input.userId;
    var gr = new GlideRecord('sys_user_has_role');
    gr.query();
    if (gr.next()) {
        return {
            "canCreate": gr.canCreate(user_id),
            "canDelete": gr.canDelete(user_id)
        };
    }
    return {
        "canCreate": false,
        "canDelete": false
    };
}
