(function(data, options, input) {
    var isMaint = gs.hasRole('maint');
    var widgetId = options.widgetId;
    if (!widgetId || widgetId === '-1') {
        data.hasEditAccess = true;
    } else {
        data.hasEditAccess = isMaint;
        if (!data.hasEditAccess) {
            var gr = new GlideRecord('sys_aix_widget');
            if (gr.get('sys_id', widgetId)) {
                data.hasEditAccess = gr.canWrite();
            }
        }
    }

    const pluginInstalled = GlidePluginManager.isActive('sn_aiux_skillkit');
    let skillActive = false;
    if (pluginInstalled) {
        try {
            const skillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
            const skill1Active = skillConfig.isSkillConfigurationActive('c7b22ba947fbfe50f59073cb416d43bd');
            const skill2Active = skillConfig.isSkillConfigurationActive('cbafedf393afb21048e6ffabdd03d67d');
            skillActive = skill1Active && skill2Active;
        } catch (e) {
            gs.debug('[aiux-builder] Could not check aiux skill config status: ' + e.message);
        }
    }
    data.isAIChatAvailable = pluginInstalled && skillActive;

    var roles = [];
    var roleGr = new GlideRecord('sys_user_role');
    roleGr.orderBy('name');
    roleGr.query();
    while (roleGr.next()) {
        roles.push({
            value: roleGr.getValue('name'),
            label: roleGr.getValue('name')
        });
    }
    data.roles = roles;
})(data, options, input);
