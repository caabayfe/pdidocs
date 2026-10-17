/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let skillConfigData = api.data.now_assist_admin_fetch_skill_config.output;
    const wasDataManuallyRefreshed = api.state.wasDataManuallyRefreshed;
    if (!skillConfigData.sys_id) {
        api.setState("skillConfigError", true);
        api.setState("noSkillConfigError", true);
        return;
    }

    // Check for record is in same domain as user session domain
    const userSessionDomainDetails = api.state.userSessionDomainDetails;
    if (userSessionDomainDetails.domainId && userSessionDomainDetails.domainId === "global" && skillConfigData.sys_domain !== "global") {
        // If admin opens child domain record in global domain, restrict the guided setup.
        api.setState("skillConfigError", true);
        api.setState("noSkillConfigError", true);
        return;
    } else if (userSessionDomainDetails.domainId && userSessionDomainDetails.domainId !== skillConfigData.sys_domain) {
        if (skillConfigData.active) {
            api.emit('MODAL_SELECTED', {
                modalId: "[component-id$='different_domain_edit_modal']",
                showModal: true
            });
        } else {
            api.emit('MODAL_SELECTED', {
                modalId: "[component-id$='different_domain_activate_modal']",
                showModal: true
            });
        }
    }

    let excludedVariableSets = ["__delivery_step__", "__summary_page__"];
    let overrideVariableSetData = {};

    skillConfigData.custom_review_content = {};

    skillConfigData.variable_sets = skillConfigData.variable_sets.filter((variable_set) => {
        if (excludedVariableSets.includes(variable_set.name)) {
            overrideVariableSetData[variable_set.name] = variable_set;
            return false;
        }

        if (variable_set.hide_step) {
            return false;
        }

        return true;
    });

    // Pushing Define Access template

    let defineAccessVariableSetData = {
        "name": skillConfigData?.translated_text?.define_access,
        "sys_scope": "7c395aaa53003110453cddeeff7b123c",
        "step_completed": !!skillConfigData.guided_setup_step_status["define-access"],
        "view_config": null,
        "order": "99997",
        "title": "", // Keeping title empty so that it doesn't show up as an extra card for custom Review Step implementation
        "description": skillConfigData.translated_text.define_access_description,
        "sys_id": "define-access",
        "screen_table": "sys_ux_macroponent",
        "screen_id": "1eebb18eff5222105df4ffffffffff53",
        "props": {
            payload:  {
                skill_config : skillConfigData.sys_id
            }
        },
        "override_sets": []

    };
    skillConfigData.variable_sets.push(defineAccessVariableSetData);

    //Pushing Delivery Template
    let selectDeliveryVariableSetData = {
        "name": skillConfigData?.translated_text?.select_and_display,
        "sys_scope": "7c395aaa53003110453cddeeff7b123c",
        "step_completed": !!skillConfigData.guided_setup_step_status["select-delivery"],
        "view_config": null,
        "order": "99998",
        "title": skillConfigData.translated_text.delivery_step_title,
        "description": skillConfigData.translated_text.delivery_step_description,
        "sys_id": "select-delivery",
        "screen_table": "sys_ux_macroponent",
        "screen_id": "83ae3f2c536cf1504410ddeeff7b1204",
        "props": {},
        "override_sets": []
    };

    if (!!overrideVariableSetData["__delivery_step__"]) {
        if (!overrideVariableSetData["__delivery_step__"].hide_step) {
            selectDeliveryVariableSetData = overrideVariableSet(overrideVariableSetData["__delivery_step__"], selectDeliveryVariableSetData);
            skillConfigData.variable_sets.push(selectDeliveryVariableSetData);
        }
    } else {
        skillConfigData.type != "custom" && skillConfigData.variable_sets.push(selectDeliveryVariableSetData);
    }

    //Pushing Review Template
    let reviewVariableSetData = {
        "name": skillConfigData?.translated_text?.review_and_activate,
        "sys_scope": "7c395aaa53003110453cddeeff7b123c",
        "step_completed": !!skillConfigData.active,
        "view_config": null,
        "order": "99999",
        "title": skillConfigData.translated_text.review_step_title,
        "description": skillConfigData.translated_text.review_step_description,
        "sys_id": "review-and-activate",
        "screen_table": "sys_ux_macroponent",
        "screen_id": "ea71637c53ac35504410ddeeff7b12ac",
        "props": {},
        "override_sets": []
    };

    if (!!overrideVariableSetData["__summary_page__"]) {
        reviewVariableSetData = overrideVariableSet(overrideVariableSetData["__summary_page__"], reviewVariableSetData);
    }

    skillConfigData.variable_sets.push(reviewVariableSetData);

    //Pushing Overview page for edited skills which are edited in NASK
    let overview = {
        "name": skillConfigData?.translated_text?.edited_skill_overview,
        "sys_scope": "7c395aaa53003110453cddeeff7b123c",
        "step_completed": skillConfigData.variable_sets.some(variable => variable.step_completed),
        "view_config": null,
        "order": "99",
        "title": skillConfigData?.translated_text?.edited_skill_overview,
        "description": skillConfigData?.translated_text?.edited_skill_overview_description,
        "screen_table": "sys_ux_macroponent",
        "screen_id": "2e25ae837f82121061d13705bc866526",
        "sys_id": "edited_in_nask_overview",
        "props": {
            "header": skillConfigData?.translated_text.edited_skill_header
        },
        "override_sets": []
    };

    skillConfigData.edited_in_nask && (skillConfigData.variable_sets.unshift(overview));
    api.setState("skillConfigError", false);

    formStepsContentTree(skillConfigData);

    function overrideVariableSet(overrideVariableSetData, variableSetData) {
        variableSetData.title = overrideVariableSetData.title || variableSetData.title;
        variableSetData.description = overrideVariableSetData.description || variableSetData.description;
        variableSetData.screen_id = overrideVariableSetData.screen_id;
        variableSetData.props = overrideVariableSetData.props;
        variableSetData.override_sets = overrideVariableSetData.override_sets;
        return variableSetData;
    }

    function formStepsContentTree(skillConfig) {
        
        const {TreeNodeUtil} = imports['sn_nowassist_admin.TreeNodeUtil']();
        
        // Filter steps that either have no parent or steps having side_nav_child prop as true => These steps include parent steps
        var skillConfigSteps = skillConfig.variable_sets.filter(step => {
            return step?.props?.side_nav_child === "true" || step?.parent == null;
        });

        // Filter steps that either have no parent or steps having side_nav_child as true and having no children => Steps shown for guided setup
        skillConfig.variable_sets = skillConfig.variable_sets.filter(step => {
            return step?.parent === undefined || ((step?.props?.side_nav_child === "true" || step?.parent === null) && (step?.override_sets?.filter(subStep => subStep?.props?.side_nav_child === "true")).length === 0)
        });

        api.setState("skillConfigData", skillConfig);
        
        const skillSteps = skillConfig?.variable_sets;
        
        // Initialize a root node
        let rootNode = new TreeNodeUtil(1, 'root');

        let nodeMap = {};

        // Create nodes for each step including parent steps
        skillConfigSteps.forEach(item => {
            nodeMap[item?.sys_id] = new TreeNodeUtil(item?.sys_id, item?.name, item?.step_completed);
        });

        // Create a nodeMap to hold the heirarchy of steps
        skillConfigSteps.forEach(item => {
            if (item?.parent == null) {
                rootNode.addChild(nodeMap[item?.sys_id]);
            } else if (item?.props?.side_nav_child === "true") {
                nodeMap[item?.parent].addChild(nodeMap[item?.sys_id]);
            }
        });

        let skillStepIndex = (api?.state?.selectedStep?.index || 0);
        let stepCount = 0;
        let tempSkillStepIndex = 0;
        let expandedItems = [];

        skillConfigSteps.forEach(item => {
            // Continue from where user left if skill is not activated
            let node = nodeMap[item?.sys_id];
            if (!skillConfig?.active && node?.step_completed) {
                tempSkillStepIndex = stepCount;
            }
            if (node?.children?.length === 0) {
                let statuses = [{
                    icon: (node?.step_completed || skillConfig?.active) ? "circle-check-fill" : (stepCount === tempSkillStepIndex ? "circle-semi-check-outline" : "circle-dashed-outline"),
                    type: "icon"
                }];
                node.setNodeData(stepCount, (stepCount === tempSkillStepIndex) ? false : (!skillConfig?.active && !node?.step_completed), statuses);
                stepCount++;
            } else {
                expandedItems.push(node.getIndexPath());
            }
        });

        let steps = rootNode.getNodeData()?.children;

        if (!skillStepIndex) {
            skillStepIndex = tempSkillStepIndex;
        }
        api.setState("expandedItems", expandedItems);
        api.setState("steps", steps);
        api.setState("wasDataManuallyRefreshed", false);
        var selectedStep = {
            index: skillStepIndex,
            itemId: []
        };
        // Saving data for selected step, pushing itemId details for parent and child steps if exists
        var stepData = skillConfig?.variable_sets[skillStepIndex];
        selectedStep?.itemId?.push(nodeMap[stepData?.sys_id].getIndexPath());
        api.setState("selectedStep", selectedStep);

        if (!skillSteps[skillStepIndex].screen_id) {
            api.setState("noScreenConfigured", true);
            api.setState("disableNextButton", true);
        } else {
            api.setState("noScreenConfigured", false);
            api.setState("disableNextButton", false);
            const skill_config_var_sets = [];

            for (let skill_config_var_set_index = 0; skill_config_var_set_index < skillConfig.variable_sets.length - 1; skill_config_var_set_index++) {
                skill_config_var_sets.push({
                    title: skillConfig.variable_sets[skill_config_var_set_index].title,
                    description: skillConfig.variable_sets[skill_config_var_set_index].description,
                    sysId: skillConfig.variable_sets[skill_config_var_set_index].sys_id,
                    override_sets: skillConfig.variable_sets[skill_config_var_set_index].override_sets,
                    props: skillConfig.variable_sets[skill_config_var_set_index].props,
                    propsMetadata: skillConfig.variable_sets[skill_config_var_set_index].propsMetadata,
                    config_type: skillConfig.variable_sets[skill_config_var_set_index].config_type,
                });
            }
            api.setState("contentTree", [{
                block_id: "123345",
                guided_context: {
                    title: skillSteps[skillStepIndex].title,
                    description: skillSteps[skillStepIndex].description,
                    skill_id: skillConfig.skill_id,
                    skill_family: skillConfig.skill_family,
                    skill_family_name: skillConfig.skill_family_name,
                    skill_family_parent: skillConfig.skill_family_parent,
                    skill_family_parent_name: skillConfig.skill_family_parent_name,
                    skill_parent: skillConfig.skill_parent,
                    skill_parent_name: skillConfig.skill_parent_name,
                    is_variant : skillConfig.is_variant,
                    skill_workflow: skillConfig.skill_workflow,
                    skill_workflow_name: skillConfig.skill_workflow_name,
                    skill_config_title: skillConfig.name,
                    skill_description: skillConfig.skill_description,
                    llmNames: skillConfig.llmNames,
                    active: skillConfig.active,
                    in_product_active: skillConfig.in_product_active,
                    in_product_roles: skillConfig.in_product_roles,
                    in_mobile_active: skillConfig.in_mobile_active,
                    in_mobile_roles: skillConfig.in_mobile_roles,
                    nap_status: skillConfig.nap_status,
                    nap_active: skillConfig.nap_active,
                    ce_roles: skillConfig.ce_roles,
                    ce_roles_mandatory: skillConfig.ce_roles_mandatory,
                    nap_skill_applicability: skillConfig.nap_skill_applicability,
                    enable_workflow_trigger: skillConfig.enable_workflow_trigger,
                    show_va_card: skillConfig.show_va_card,
                    selected_ce: skillConfig.selected_ce,
                    selected_va_list: skillConfig.selected_va_list,
                    va_active: skillConfig.va_active,
                    override_sets: skillSteps[skillStepIndex].override_sets,
                    sysId: skillSteps[skillStepIndex].sys_id,
                    skill_config_id: skillConfig.sys_id,
                    skill_config_var_sets: skill_config_var_sets,
                    translated_text: skillConfig.translated_text,
                    custom_review_content: skillConfig.custom_review_content,
                    type: skillConfig.type,
                    isGeneratedFromSkillKit: skillConfig.isGeneratedFromSkillKit,
                    wasDataManuallyRefreshed: wasDataManuallyRefreshed,
                    ...skillSteps[skillStepIndex].props,
                    aclData: skillConfig.aclData,
                    ui_action_roles: skillConfig.ui_action_roles,
                    ui_action_id : skillConfig.ui_action_id,
                    ui_action_active: skillConfig.ui_action_active,
                    skill_config_order: skillConfig.order,
                    roleMaskingData : skillConfig.roleMaskingData,
                    allowEditingRMRoles : skillConfig.allowEditingRMRoles
                },
                props_details: {},
                type: {
                    macroponent: skillSteps[skillStepIndex].screen_id
                }
            }]);
        }
    }
}
