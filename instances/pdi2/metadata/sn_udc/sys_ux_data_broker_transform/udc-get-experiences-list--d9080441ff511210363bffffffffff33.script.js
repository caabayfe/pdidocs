function transform(input) {
    // TODO: once DEF0589428 is resolved by uxf, update condition to input.enableExperienceSwitcher
    if (JSON.parse((input.enableExperienceSwitcher)).enableExperienceSwitcher) {
        return sn_udc.ExperienceConfiguration.getExperienceList();
    }
    return [];
}
