function transform(input) {
    try {
        var isSubmitClicked = typeof input.isSubmit === 'boolean' ? input.isSubmit : (input.isSubmit === 'true') ? true : false;
        if (!input.skillName || !isSubmitClicked || !input.workflowId || !input.productId) {
            return {
                success: false,
                skillConfigId: ""
            };
        }
        var utils = new sn_wwna.NAAWWNAUtils();
        var res = utils.cloneCapabilityAndSkillConfig(input.skillName, input.workflowId, input.productId);
        return res;
    } catch (err) {
        return {
            success: false,
            skillConfigId: "",
            message: (err && err.message) || ''
        };
    }

}
