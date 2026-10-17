function transform(input) {
    try {
        var isDeactivateClicked = typeof input.deactivateSkillConfigClicked === 'boolean' ? input.deactivateSkillConfigClicked : (input.deactivateSkillConfigClicked === 'true') ? true : false;
        if (!isDeactivateClicked || (input.deactivateSkillConfigId == '')) {
            return {
                success: false
            };
        }

        const deactivate = NAASkilConfigActivateToggler.deActivateSkillConfig(input.deactivateSkillConfigId);
        return {
            success: deactivate.update == false ? false : true
        };
    } catch (e) {
        return {
            success: false
        };
    }
}
