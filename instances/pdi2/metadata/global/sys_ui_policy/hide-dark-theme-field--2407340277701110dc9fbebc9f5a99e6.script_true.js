function onCondition() {
    var enableDarkThemePortals = g_scratchpad.enableDarkThemePortals;
    var currentPortalSysId = g_form.getUniqueValue();
    var portalSysIds = enableDarkThemePortals.split(/\s*,\s*/).map(function(portalSysId) {
        return portalSysId.trim();
    });
    if (portalSysIds.indexOf(currentPortalSysId) === -1) {
      g_form.setDisplay("dark_theme", false);
    }
}
