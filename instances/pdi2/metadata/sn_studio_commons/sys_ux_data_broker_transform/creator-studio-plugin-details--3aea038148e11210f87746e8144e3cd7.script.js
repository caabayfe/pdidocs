function transform() {

    const creatorStudioPluginId = 'com.app_creator_studio';
    const experienceType = 'creator_studio';
    const creatorStudioMessages = {
        notInstalled: {
            headerText: gs.getMessage("Creator Studio hasn't been installed yet"),
            paragraphText: gs.getMessage("Once your admin installs it, you can start using this no-code app builder.")
        },
        notUpdated: {
            headerText: gs.getMessage("Creator Studio hasn't been updated yet"),
            paragraphText: gs.getMessage("Once your admin updates Creator Studio, you can start using this no-code app builder.")
        }
    };

    if (!GlidePluginManager.isActive(creatorStudioPluginId)) {
        return creatorStudioMessages.notInstalled;
    }

    if (!sn_udc.ExperienceConfiguration.isExperienceAvailable(experienceType)) {
        return creatorStudioMessages.notUpdated;
    }
}
