var StarterPortalGenerator = Class.create();
StarterPortalGenerator.prototype = {
    initialize: function() {},

    isStarterTemplateScope: function() {
        return gs.getCallerScopeName() === "sn_portal_starte_0" || gs.getCallerScopeName() === "rhino.global";
    },

    getCompanyCode: function(url) {
        var urlData = url.split("/");
        var code = "";
        if (urlData[0] != "now" && urlData[0] != "snc" && urlData[0] != "sn") {
            code = urlData[1];
            return code;
        } else {
            return urlData[0];
        }
    },

    updatePageProperty: function(pagePropertyId, newValue) {
        if (!this.isStarterTemplateScope())
            return;

        var gr = new GlideRecord('sys_ux_page_property');
        gr.get(pagePropertyId);

        var portalConfigUtil = new global.UXStarterExperiencePostOperation();
        portalConfigUtil.update(gr, {
            'value': newValue
        });
    },

    insertTemplateInputs: function(templateInstanceId, name, value) {
        if (!this.isStarterTemplateScope())
            return;

        var gr = new GlideRecord('sys_app_template_input_var_instance');

        var newTemplateInputs = {};
        newTemplateInputs.template_instance = templateInstanceId;
        newTemplateInputs.name = name;
        newTemplateInputs.value = value;

        var portalConfigUtil = new global.UXStarterExperiencePostOperation();
        portalConfigUtil.update(gr, newTemplateInputs);
    },

    insertAclRoles: function(aclSysId, roleId) {
        if (!this.isStarterTemplateScope())
            return;

        var aclRoleGR = new GlideRecord("sys_security_acl_role");

        var aclRoleInputs = {};
        aclRoleInputs.sys_security_acl = aclSysId;
        aclRoleInputs.sys_user_role = roleId;

        var portalConfigUtil = new global.UXStarterExperiencePostOperation();
        portalConfigUtil.insert(aclRoleGR, aclRoleInputs);
    },

    updateUiViewNames: function(app_sys_id, exp_registry_id, viewNames) {
        if (!this.isStarterTemplateScope())
            return;

        var ux_app_record = this.getValidUxAppRecord(exp_registry_id);

        // Get the first experience in the list of experiences ordered by sys_created_on
        if (ux_app_record) {
            this.updateMacroponent(ux_app_record, app_sys_id, "Preferences Default", "custom_portal_settings", viewNames["settings_view"]);
            this.updateMacroponent(ux_app_record, app_sys_id, "Landing Page Default", "custom_portal_approval", viewNames["approval_view"]);
            this.updateMacroponent(ux_app_record, app_sys_id, "Tasks Default", "custom_portal_approval", viewNames["approval_view"]);
        }
    },

    getValidUxAppRecord: function(exp_registry_id) {
        if (!this.isStarterTemplateScope())
            return;

        if (!exp_registry_id) {
            gs.error("sys_ux_page_registry for creating starter portal is not valid");
            return;
        }

        var ux_app_record = new GlideRecord("sys_ux_page_registry");
        ux_app_record.get(exp_registry_id);

        return ux_app_record;
    },

    updateDbImageNames: function(app_sys_id, exp_registry_id, imageNames) {
        if (!this.isStarterTemplateScope())
            return;

        var ux_app_record = this.getValidUxAppRecord(exp_registry_id);
        var scopeGr = new GlideRecord("sys_app");
        scopeGr.get(app_sys_id);

        if (scopeGr && ux_app_record) {
            var scopeName = scopeGr.getValue("scope");
            var oldLandingImage = scopeName + ".custom_portal_banner.svg";
            var oldLoginImage = scopeName + ".custom_portal_login.svg";

            this.updateMacroponent(ux_app_record, app_sys_id, "Landing Page Default", oldLandingImage, imageNames["landing_image"], true);
            this.updateMacroponent(ux_app_record, app_sys_id, "Login Default", oldLoginImage, imageNames["login_image"], true);
        }
        // Get the first experience in the list of experiences ordered by sys_created_on

    },

    updateMacroponent: function(ux_app_record, app_sys_id, screenName, viewName, newViewName, isLayout) {
        if (!this.isStarterTemplateScope())
            return;

        var admin_panel = ux_app_record.admin_panel;
        var scopeName;

        var screenRecord = new GlideRecord("sys_ux_screen");
        screenRecord.addEncodedQuery("name=" + screenName + "^app_config=" + admin_panel.sys_id);
        screenRecord.query();

        while (screenRecord.next()) {
            var macroponent = new GlideRecord("sys_ux_macroponent");
            macroponent.get("sys_id", screenRecord.getValue("macroponent"));
            if (macroponent) {
                var composition = macroponent.composition;
                var data = macroponent.data;
                var scopeGR = new GlideRecord("sys_app");
                scopeGR.get(app_sys_id);

                if (scopeGR) {
                    scopeName = scopeGR.getValue('scope');

                    composition = composition.toString().replaceAll(viewName, newViewName);
                    macroponent.composition = composition;

                    data = data.toString().replaceAll(viewName, newViewName);
                    macroponent.data = data;

                    var newMacroponentProps = {};
                    newMacroponentProps.data = data;
                    newMacroponentProps.composition = composition;

                    if (isLayout) {
                        var layout = macroponent.layout;
                        layout = layout.toString().replaceAll(viewName, newViewName);
                        macroponent.layout = layout;
                        newMacroponentProps.layout = layout;
                    }

                    var portalConfigUtil = new global.UXStarterExperiencePostOperation();
                    portalConfigUtil.update(macroponent, newMacroponentProps);
                }
            }
        }
    },

    type: 'StarterPortalGenerator'
};
