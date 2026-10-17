(function process( /*ResolverEnvironment*/ env) {
    return {
        hasPlaybookGenerationAccess: PDUtils.isPlaybookGenerationEnabledForUser(),
        hasPlaybookRecommendationsAccess: PDUtils.isPlaybookRecommendationsEnabledForUser(),
        hasPlaybookGenerationWithImageAccess: PDUtils.isPlaybookGenerationWithImageEnabledForUser(),
        hasPlaybookSummarizationAccess: PDUtils.isPlaybookSummarizationEnabledForUser(),
        hasPlaybookGenerationWithKBAccess: PDUtils.isPlaybookGenerationWithKBEnabledForUser()
    };
})(env);
