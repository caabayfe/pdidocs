function transform(input) {
    try {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
		util.toggleUiActionState(input.uiActionId, input.state);
		util.updateUiActionRoles(input.uiActionId,input.roles);
    } catch (e) {
		gs.error("Toggle ui action failed: "+ e);
		throw new Error("Toggle ui action failed");
    }
}
