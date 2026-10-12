var SOWLandingPageUpgradeUtil = Class.create();
SOWLandingPageUpgradeUtil.prototype = {
    initialize: function() {},

    TIER_1: {
        overviewScreenCollection: "3ade5ca4c7323010d7e818b1c7c26063",
        clientScriptInclude: "a1dcc9e7b77c3010e69dbc16de11a93b",
        legacyVariant: "b034cf7877410110c05d885d9f5a9912",
        legacyOverviewVariant: "34f5647453033010b288ddeeff7b122b",
        newVariant: "ad0e332c470c5210632ef855516d43ed",
        lowerOrder: 50,
        configurationSetting: "ed94472343041210907f7ebba7b8f207"
    },
    TIER_2: {
        overviewScreenCollection: "5f7c9d0e538301103eacddeeff7b1230",
        clientScriptInclude: "6ce083ce530301103eacddeeff7b1208",
        legacyVariant: "cbc2f24977070110949878dabd5a9935",
        legacyOverviewVariant: "937c9d0e538301103eacddeeff7b1237",
        newVariant: "002732ff47409210632ef855516d43b7",
        lowerOrder: 150,
        configurationSetting: "ec54032343041210907f7ebba7b8f249"
    },
    SOW_HOME_SCREEN_COLLECTION: "dc44f57a0b1001106237818393673a02",
    TABLES: {
        SYS_UX_SCREEN: "sys_ux_screen",
        SYS_UX_CLIENT_SCRIPT_INCLUDE: "sys_ux_client_script_include",
        SYS_UX_SCREEN_CONDITION: "sys_ux_screen_condition",
        SYS_UX_APPLICABILITY_M2M_SCREEN: "sys_ux_applicability_m2m_screen",
        SN_SOW_CFG_STG: "sn_sow_cfg_stg"
    },

    _hasCustomVariant: function(screenCollection) {
        var variantGR = new GlideRecord(this.TABLES.SYS_UX_SCREEN);
        variantGR.addQuery("screen_type", screenCollection);
        variantGR.query();
        while (variantGR.next()) {
            if (this.isRecordCustomised(this.TABLES.SYS_UX_SCREEN, variantGR.getUniqueValue()))
                return true;
        }
        return false;
    },
    _hasCustomScriptedScreenCondition: function(variant) {
        var screenConditionGR = new GlideRecord(this.TABLES.SYS_UX_SCREEN_CONDITION);
        screenConditionGR.addQuery("screen", variant);
        screenConditionGR.query();
        while (screenConditionGR.next()) {
            if (this.isRecordCustomised(this.TABLES.SYS_UX_SCREEN_CONDITION, screenConditionGR.getUniqueValue()))
                return true;
        }
        return false;
    },
    _hasCustomAudience: function(variant) {
        var applicabilityM2MGR = new GlideRecord(this.TABLES.SYS_UX_APPLICABILITY_M2M_SCREEN);
        applicabilityM2MGR.addQuery("screen", variant);
        applicabilityM2MGR.query();
        while (applicabilityM2MGR.next()) {
            if (this.isRecordCustomised(this.TABLES.SYS_UX_APPLICABILITY_M2M_SCREEN, applicabilityM2MGR.getUniqueValue()))
                return true;
        }
        return false;
    },

    isRecordCustomised: function(tableName, sysId) {
        var collisionAPI = sn_collision.CollisionAPI;
        return !collisionAPI.willBeReplacedOnUpgrade(tableName + "_" + sysId);
    },
    isLegacyVariantCustomised: function(metadata) {
        //is legacy overview screen collection having a custom variant
        if (this._hasCustomVariant(metadata.overviewScreenCollection))
            return true;
        //is legacy overview variant having any scripted screen condition record which is custom
        if (this._hasCustomScriptedScreenCondition(metadata.legacyOverviewVariant))
            return true;
        //is legacy overview variant having any audience which is custom
        if (this._hasCustomAudience(metadata.legacyOverviewVariant))
            return true;
        //is client script include for page variant customised
        if (this.isRecordCustomised(this.TABLES.SYS_UX_CLIENT_SCRIPT_INCLUDE, metadata.clientScriptInclude))
            return true;
        //is landing page variant having any screen condition which is customised
        if (this._hasCustomScriptedScreenCondition(metadata.legacyVariant))
            return true;
        //is landing page variant having any audience which is custom
        if (this._hasCustomAudience(metadata.legacyVariant))
            return true;
    },
    _deactivateVariant: function(variant) {
        var variantGR = new GlideRecord(this.TABLES.SYS_UX_SCREEN);
        if (variantGR.get(variant)) {
            variantGR.setValue("active", false);
            variantGR.update();
            gs.info("Deactivated SOW landing page variant {0}", variant);
        }
    },
    _updateConfigurationSetting: function(sysId) {
        var configSettingGR = new GlideRecord(this.TABLES.SN_SOW_CFG_STG);
        if (configSettingGR.get(sysId)) {
            var valueStr = configSettingGR.getValue("value");
            try {
                var valueObj = JSON.parse(valueStr);
                valueObj.migrated_from = "upgrade-script";
                valueObj.status = "complete";
                configSettingGR.setValue("value", JSON.stringify(valueObj));
                configSettingGR.update();
            } catch (e) {
                gs.info("Error parsing SOW configuration setting value for {0}", sysId);
            }
        } else {
            gs.info("SOW configuration setting {0} not found", sysId);
        }
    },
    handleVariants: function() {
        //is landing page having a custom variant
        if (this._hasCustomVariant(this.SOW_HOME_SCREEN_COLLECTION)) {
            gs.info("SOW landing page has a custom variant hence not deactivating legacy landing page variants");
            return;
        }
        if (!this.isLegacyVariantCustomised(this.TIER_1)) {
            this._deactivateVariant(this.TIER_1.legacyVariant);
            this._updateConfigurationSetting(this.TIER_1.configurationSetting);
        }
        if (!this.isLegacyVariantCustomised(this.TIER_2)) {
            this._deactivateVariant(this.TIER_2.legacyVariant);
            this._updateConfigurationSetting(this.TIER_2.configurationSetting);
        }
    },

    type: 'SOWLandingPageUpgradeUtil'
};
