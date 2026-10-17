function updateInitialValuesForGuidanceAndInteractions() {
    var constants = new sn_ads_setup.SNHelpSetupConstantProvider();
    var player = new sn_ads_setup.SNHelpSetupPlayerController();
    player.updateInitialValuesForGuidanceAndInteractions();
    player.updateDefaultValueForSysDomainPathInExistingRecord(constants.tables.user_interaction, 'guidance.type=global_setup');
    player.updateDefaultValueForSysDomainPathInExistingRecord(constants.tables.user_interaction_step, 'step.guidance.type=global_setup');
}

updateInitialValuesForGuidanceAndInteractions();
