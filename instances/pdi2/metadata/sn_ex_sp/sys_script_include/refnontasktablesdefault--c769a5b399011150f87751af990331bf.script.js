var RefNonTaskTablesDefault = Class.create();
RefNonTaskTablesDefault.prototype = {

    getRefTables: function() {
        var extensions = ['kb_knowledge'];
        if (GlidePluginManager.isActive('sn_wsd_rsv'))
            extensions.push('sn_wsd_rsv_reservation');

        if (GlidePluginManager.isActive('sn_risk_advanced'))
            extensions.push('sn_risk_advanced_risk_assessment_instance');

        if (GlidePluginManager().isActive("sn_dlir"))
            extensions.push("sn_dlir_incident");

        if (GlidePluginManager().isActive('com.sn_jny'))
            extensions.push('sn_ja_plan_config_aux');

        if (GlidePluginManager().isActive('com.sn_opp_market'))
            extensions.push('sn_opp_market_opportunity');

        if (GlidePluginManager().isActive('sn_vul'))
            extensions.push('sn_vul_change_approval');

        if (GlidePluginManager().isActive('sn_vulc'))
            extensions.push('sn_vulc_state_change_approval');

        return extensions;
    },

    type: 'RefNonTaskTablesDefault'
};
