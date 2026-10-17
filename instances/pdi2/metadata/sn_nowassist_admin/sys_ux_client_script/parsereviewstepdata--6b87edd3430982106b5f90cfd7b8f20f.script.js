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
    const stepsInformation = api.data.get_review_skill_config_data.transformSkillConfigData || [];
    const deliveryStepSysId = "select-delivery";

    updateFields(stepsInformation);

    function updateFields(stepsInformation) {
        if (stepsInformation.length === 0) {
            return;
        }
        stepsInformation.forEach(step => {
            if (step.fields && Array.isArray(step.fields)) {
                step.fields.forEach(field => {
                    field.value = {
                        type: "string",
                        value: field.value.replace(/\\"/g, '"').replace(/\\\\/g, '\\'),
                        ...field.valueProps
                    };
                });
            }
            if (step.sections && Array.isArray(step.sections)) {
                updateFields(step.sections);
            }
        });
    }

    //flatten sections in to parent sections key
    stepsInformation.forEach(stepInfo => {
        if (stepInfo.sections)
            stepInfo.sections = flattenSections(stepInfo);
    });

    function flattenSections(stepInfo) {
        let combinedSections = [];

        function traverseSections(sections) {
            sections.forEach(section => {
                combinedSections.push(section);
                if (section.sections && section.sections.length > 0) {
                    traverseSections(section.sections);
                    delete section.sections;
                }
            });
        }
        if (stepInfo.sections && stepInfo.sections.length > 0)
            traverseSections(stepInfo.sections);
        return combinedSections;
    }



    const {
        in_product_active,
        in_product_roles,
        in_mobile_active,
        in_mobile_roles,
        nap_active,
        nap_status,
        nap_skill_applicability,
        ce_roles,
        skill_description,
        show_inproduct_card,
        show_nap_card,
        show_in_mobile_card,
        skill_config_var_sets,
        translated_text,
        custom_review_content,
        type,
        isGeneratedFromSkillKit
    } = api.context.props.payload.guided_context;

    //Review Card data for select display step
    if (skill_config_var_sets.length > 0 && skill_config_var_sets[skill_config_var_sets.length - 1]['sysId'] == deliveryStepSysId) {
        let deliveryStepProps = skill_config_var_sets[skill_config_var_sets.length - 1].props;

        if (!!custom_review_content[deliveryStepSysId]) {
            stepsInformation.push({
                title: custom_review_content[deliveryStepSysId].title,
                subtitle: !!custom_review_content[deliveryStepSysId].description && custom_review_content[deliveryStepSysId].description.startsWith("<") ? custom_review_content[deliveryStepSysId].description : "<p style='margin-bottom:0px;'>" + custom_review_content[deliveryStepSysId].description + "</p>",
                props: []
            });
        } else {
            if (!isGeneratedFromSkillKit && !(show_inproduct_card == "false") && !(deliveryStepProps.show_inproduct_card == "false") && !(!!stepsInformation.find((step) => step.id === "delivery_step_inProduct"))) {
                let stepInfoData = {
                    title: api.state.review_step_in_product_card_title,
                    subtitle: "",
                    props: []
                };

                if (in_product_active && !!in_product_roles) {
                    stepInfoData.subtitle = `<div><p style='margin-bottom:0px;'>${translated_text.yes_for_the_following_roles}</p><p style='margin-bottom:0px; font-weight:700;'>${in_product_roles.split(",").join(" | ")}</p></div>`;
                } else if (in_product_active) {
                    stepInfoData.subtitle = `<p>${translated_text.yes}</p>`;
                } else {
                    stepInfoData.subtitle = `<p>${translated_text.no}</p>`;
                }

                stepsInformation.push(stepInfoData);
            }

            if (!isGeneratedFromSkillKit && !!nap_skill_applicability && nap_status.nowAssistPanelEnabled && !(show_nap_card == "false") && !(deliveryStepProps.show_nap_card == "false") && !(!!stepsInformation.find((step) => step.id === "delivery_step_nap"))) {
                let stepInfoData = {
                    title: api.state.review_step_nap_card_title,
                    subtitle: "",
                    props: []
                };

                if (nap_active && !!ce_roles) {
                    stepInfoData.subtitle = `<div><p style='margin-bottom:0px;'>${translated_text.yes_for_the_following_roles}</p><p style='margin-bottom:0px; font-weight:700;'>${ce_roles.split(",").join(" | ")}</p></div>`;
                } else if (nap_active) {
                    stepInfoData.subtitle = `<p>${translated_text.yes}</p>`;
                } else {
                    stepInfoData.subtitle = `<p>${translated_text.no}</p>`;
                }

                stepsInformation.push(stepInfoData);
            }

            if (!isGeneratedFromSkillKit && !(show_in_mobile_card == "false") && deliveryStepProps.show_in_mobile_card == "true" && !(!!stepsInformation.find((step) => step.id === "delivery_step_inMobile"))) {
                let stepInfoData = {
                    title: api.state.review_step_in_mobile_card_title,
                    subtitle: "",
                    props: []
                };

                if (in_mobile_active && !!in_mobile_roles) {
                    stepInfoData.subtitle = `<div><p style='margin-bottom:0px;'>${translated_text.yes_for_the_following_roles}</p><p style='margin-bottom:0px; font-weight:700;'>${in_mobile_roles.split(",").join(" | ")}</p></div>`;
                } else if (in_mobile_active) {
                    stepInfoData.subtitle = `<p>${translated_text.yes}</p>`;
                } else {
                    stepInfoData.subtitle = `<p>${translated_text.no}</p>`;
                }

                stepsInformation.push(stepInfoData);
            }
        }
    }
    api.setState("reviewStepsArray", stepsInformation);
    api.setState("loadingData", false);
}
