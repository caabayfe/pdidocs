function transform(input) {
    if (!input.payload || (input.payload && !Object.keys(input.payload).length)) {
        return {
            success: false,
            message: ''
        };
    }
    var naaWWNAUtils = new sn_wwna.NAAWWNAUtils();
    let result = naaWWNAUtils.updateSkillNameAndDescription(input.skillConfigId, input.payload.skillConfigName, input.payload.skillConfigDescription, input.payload.skillConfigOrder);
    if (result.success) {
        var apiOutput = naaWWNAUtils.createAndUpdateVarSet(input.skillConfigId, input.actionTemplateVarSetId, input?.payload?.guided_context?.variables);
        if (apiOutput.success) {
            input.payload.guided_context.variables = apiOutput.skillConfigVariables;
            return {
                success: true,
                ...input.payload
            };
        } else {
            return apiOutput;
        }
    } else {
        return result;
    }
}
