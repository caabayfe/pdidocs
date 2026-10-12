(function process( /*ResolverEnvironment*/ env) {
    var skillId = env.getArguments().skillId;
    return new sn_nowassist_admin.NowAssistSkillConfig().isSkillConfigurationActive(skillId);
})(env);
