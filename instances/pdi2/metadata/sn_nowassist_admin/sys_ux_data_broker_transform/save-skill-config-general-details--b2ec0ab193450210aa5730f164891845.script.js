function transform(input) {
    if (!input || !input.payload)
        return false;
    var response = NowAdminAssistUtil.saveSkillConfigGeneralDetailsAPI(input.payload);
    return response;
}
