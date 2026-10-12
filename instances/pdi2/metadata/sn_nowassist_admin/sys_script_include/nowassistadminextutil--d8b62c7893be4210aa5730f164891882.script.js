var NowAssistAdminExtUtil = Class.create();
NowAssistAdminExtUtil.prototype = {
    initialize: function() {},

    /**
     * hasMatchingCondition for the skill will validate the matching condition and returns boolean
     * 
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * 
     * @return {Boolean} if hasMatchingCondition matches the condition it will return true else false
     * if true, we will pick that specific implementation methods.
     **/
    hasMatchingCondition: function(skillConfigObj) {
        if (!gs.nil(skillConfigObj)) {
            var skillConfigVarGr = new GlideRecord("sn_nowassist_skill_config_var_set");
            var meta = new sn_nowassist_admin.NowAdminAssistMetadata();

            skillConfigVarGr.addQuery("skill_config.sys_id", skillConfigObj.skill_config_id);
            // Below sys_id is 'Skill builder Delivery step','Skill builder View Trigger step' config types respectively
            skillConfigVarGr.addQuery("config_type.sys_id", "IN", meta.DEFAULT_SKILL_BUILDER_DELIVERY_STEP_CONFIG_TYPE.concat(",", meta.DEFAULT_VIEW_TRIGGER_VAR_SET_CONFIG_TYPE));

            skillConfigVarGr.query();
            skillConfigVarGr.next();
            return skillConfigObj.type === "custom" || skillConfigVarGr.getRowCount() > 0;
        }
        return false;
    },

    /**
     * getViewTriggerCardData for the skill will return transformed view trigger data from viewTriggerVarSet
     *
     * @param {Obj} viewTriggerVarSet - The obj contains data of a view trigger config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    getViewTriggerCardData: function(viewTriggerVarSet) {
        var viewTriggerStepProps = viewTriggerVarSet.props;
        var viewTriggerCardData = {
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", "What triggers are being used?"),
            subtitle: "",
            sections: [],
            props: []
        };
        viewTriggerCardData.sections.push({
            fields: [{
                label: "Triggers",
                value: viewTriggerStepProps?.enable_workflow_trigger ? "Flow Action" : sn_i18n.Message.getMessage("sn_nowassist_admin", "None")
            }]
        });
        return viewTriggerCardData;

    },

    /**
     * addInproductSectionData for the skill will return transformed in-product data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * @param {Obj} displayCard - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    addInproductSectionData: function(skillConfigObj, displayCard) {
        if (skillConfigObj.in_product_active) {
            var inProductRoles = skillConfigObj.in_product_roles ? skillConfigObj.in_product_roles.replace(',', ' | ') : "undefined";
            displayCard.sections.push({
                title: sn_i18n.Message.getMessage("sn_nowassist_admin", "In-product Desktop"),
                subtitle: "",
                fields: [{
                    label: "Roles",
                    value: inProductRoles.toString()
                }],
                sections: []
            });
        }
        return displayCard;
    },

    /**
     * addUiActionSectionData for the skill will return transformed ui action data from deliveryVarSet
     *
     * @param {Obj} deliveryVarSet - The obj contains data of a delivery config
     * @param {Obj} displayCard - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    addUiActionSectionData: function(deliveryVarSet, displayCard) {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var uiActionSysId = deliveryVarSet.props?.ui_action_id;
        if (!gs.nil(uiActionSysId)) {
            var uiActionActiveStatus = util.getUiActionState(uiActionSysId).active === "true";
            if (uiActionActiveStatus) {
                var coreUIRoles = util.getUiActionRoles(uiActionSysId);
                var coreUiRolesText = coreUIRoles?.length ? coreUIRoles.map(role => role.label).join(' | ') : "undefined";
                displayCard.sections.push({
                    title: sn_i18n.Message.getMessage("sn_nowassist_admin", "Core UI"),
                    subtitle: "",
                    fields: [{
                        label: "Roles",
                        value: coreUiRolesText.toString()
                    }],
                    sections: []
                });
            }
        }
        return displayCard;

    },

    /**
     * addConversationalSectionData for the skill will return transformed conversational data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * @param {Obj} displayCard - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    addConversationalSectionData: function(skillConfigObj, displayCard) {
        if (skillConfigObj?.selected_ce?.length) {
            var selected_ce = skillConfigObj.selected_ce.map(item => item.label).join(', ');
            var selected_va_list = skillConfigObj.selected_va_list ? skillConfigObj.selected_va_list.filter(item => item.type !== "nap").map(item => item.label).join(', ') : "";
            var ce_roles = skillConfigObj.ce_roles;
            var conversationalExperienceCardData = {
                title: sn_i18n.Message.getMessage("sn_nowassist_admin", "Conversational experiences"),
                subtitle: "",
                fields: [{
                    label: "Displays",
                    value: selected_ce.toString()
                }],
                sections: []
            };
            if (skillConfigObj.selected_ce.some(item => item.id === "va")) {
                conversationalExperienceCardData.fields.push({
                    label: "Virtual Assistants",
                    value: selected_va_list.toString()
                });
            }
            conversationalExperienceCardData.fields.push({
                label: "Roles",
                value: ce_roles.toString()
            });
            displayCard.sections.push(conversationalExperienceCardData);
        }
        return displayCard;
    },

    /**
     * addNacmSectionData for the skill will return transformed nacm data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * @param {Obj} displayCard - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    addNacmSectionData: function(skillConfigObj, displayCard) {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var result = util.getNacmDetailsForSkillConfig(skillConfigObj.skill_config_id);
        var nacmValue = result?.activeRecords?.length > 0 ? "true" : (result?.inactiveRecords?.length > 0 ? "false" : "");
        if (!gs.nil(nacmValue) && nacmValue === "true") {
            displayCard.sections.push({
                title: sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist context menu"),
                subtitle: "",
                fields: [],
                sections: []
            });
        }
        return displayCard;

    },

    /**
     * getDisplayCardData for the skill will return transformed display data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * @param {Obj} deliveryVarSet - The obj contains data of a delivery config
     * @param {Obj} extUtil - The obj contains extension util methods
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    getDisplayCardData: function(skillConfigObj, deliveryVarSet, extUtil) {
        var displayCard = {
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", "Where will the {skillName} be displayed?", {
                skillName: skillConfigObj.skill_config_title
            }),
            subtitle: "",
            fields: [],
            sections: []
        };

        if (deliveryVarSet.props.enable_in_product === "true") {
            displayCard = extUtil.addInproductSectionData(skillConfigObj, displayCard);
        }
		
        displayCard = extUtil.addUiActionSectionData(deliveryVarSet, displayCard);

        displayCard = extUtil.addConversationalSectionData(skillConfigObj, displayCard);
        displayCard = extUtil.addNacmSectionData(skillConfigObj, displayCard);

        // Case when none of the display modality is selected
        if (displayCard.sections.length === 0) {
            displayCard.sections.push({
                title: sn_i18n.Message.getMessage("sn_nowassist_admin", "None"),
                subtitle: "",
                fields: [],
                sections: []
            });
        }
        return displayCard;
    },

    /**
     * getReviewPayload for the skill will return transformed review data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config 
     * @param {Obj} payload - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    getReviewPayload: function(skillConfigObj, payload) {
        //reference code is in below api call
        // var util = new sn_nowassist_admin.NowAdminAssistUtil();
        // return util.getReviewPayload(skillConfigObj);
        // If you need in-product and NAP cards to be overriden in this review payload, make sure to create necassary objects honoring the template in the array with id as follows :
        // For inProduct card, id should be -> delivery_step_inProduct
        // For NAP card, id should be -> delivery_step_nap
        //gs.info(JSON.stringify(skillConfigObj));
        try {

            var meta = new sn_nowassist_admin.NowAdminAssistMetadata();
            var extUtil = new sn_nowassist_admin.NowAssistAdminExtUtil();
            var reviewPayload = [];
            // Pushing general card
            var generalCard = {
                title: sn_i18n.Message.getMessage("sn_nowassist_admin", "How will it work?"),
                subtitle: skillConfigObj.skill_description || "",
                fields: [],
                sections: []
            };
            reviewPayload.push(generalCard);

            var varSets = skillConfigObj.skill_config_var_sets;
            var deliveryVarSet = varSets.find((varSet) => {
                return varSet.sysId == meta.DELIVERY_VAR_SET_SYS_ID;
            });
            var viewTriggerVarSet = varSets.find(varSet => varSet.config_type === meta.DEFAULT_VIEW_TRIGGER_VAR_SET_CONFIG_TYPE);

            //Review card for view trigger
            if (!!viewTriggerVarSet) {
                reviewPayload.push(extUtil.getViewTriggerCardData(viewTriggerVarSet));
            }
            // Pushing define access card data
            var accessCardData = NAASkillConfigUtil.getReviewAccessCardData(skillConfigObj);
            reviewPayload.push(accessCardData);

            // Pushing display card
            var displayCard = extUtil.getDisplayCardData(skillConfigObj, deliveryVarSet, extUtil);
            reviewPayload.push(displayCard);

            return reviewPayload;
        } catch (error) {
            gs.error(error);
        }

    },
    type: 'NowAssistAdminExtUtil'
};
