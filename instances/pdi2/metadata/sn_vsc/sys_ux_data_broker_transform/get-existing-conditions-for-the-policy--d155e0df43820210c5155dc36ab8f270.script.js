function transform(input) {
	var id = input && input.sys_id;
    var resp = {
        "conditions_for_ui": [],
        "existingConditionsOfPolicyIds": []
    };
    if (id) {
        var util = new SCSecurityPolicyUtil();
        var res = util.getExistingPolicyConditions(id);
        resp.conditions_for_ui = res.conditions_for_ui;
        resp.existingConditionsOfPolicyIds = res.existingConditionsOfPolicyIds;
    }
    return resp;
}
