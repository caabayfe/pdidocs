/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {SkillOperationUtil} = imports['sn_nowassist_admin.SkillOperationUtil']();
    var getSkillDataForProductOutput = event.payload?.data?.output;
    api.setState('allSkillData', getSkillDataForProductOutput);

        var supportedProviders = Array.from(
        new Set(
            (getSkillDataForProductOutput.skillData || []).flatMap(item => 
            (item.skillProvider || "")
                .split(",")
                .map(p => p.trim())
                .filter(p => p)
            )
        )
    ).map(p => ({ id: p, label: p }));
    api.setState('supportedProviders', supportedProviders);

    var columnDefinitions = getSkillDataForProductOutput.columnDefinitions;
    var filter = {
        filterProviderVal: api.state.filterProviderVal,
        filterStateVal: api.state.filterStateVal,
        filterTypeVal: api.state.filterTypeVal,
        filterFeatureVal: api.state.filterFeatureVal
    };
    var result = SkillOperationUtil.applySearchAndFilter(getSkillDataForProductOutput, {
        searchTerm: api.state.searchTerm,
        filter: filter,
        sortBy: api.state.sortBy
    });
    //Replace hyperlinks in the description text in summary
    function updateDescriptions(inputSummaryData) {
        inputSummaryData.forEach(item => {
            if (item.description) {
                item.description = convertAnchorToNowTextLink(item.description);
            }
        });
        return inputSummaryData;
    }
    //Convert the Hyperlink tags to Text-Link tags
    function convertAnchorToNowTextLink(inputText) {
        if (!inputText) return inputText;

        // Step 1: Replace <a with <now-text-link
        let updatedText = inputText.replace(/<a\b/gi, '<now-text-link variant="primary" opens-window="true" icon-start="open-link-right-outline"');

        // Step 2: Replace title="..." with label="..."
        updatedText = updatedText.replace(/title=/gi, 'label=');

        return updatedText;
    }
    var summary = updateDescriptions(getSkillDataForProductOutput.summaryData);

    // Update filter count
    const filterCount = [filter.filterProviderVal, filter.filterTypeVal].reduce((count, arr) => count + (arr.length > 0 ? 1 : 0), 0);
    api.setState('filterCount', filterCount);

    saveSkillData(result.skillCardData, result.skillListData);

    api.setState('monitorResultsObj', getSkillDataForProductOutput.monitorResultsObj);
    api.setState('columnDefinitions', columnDefinitions);
    api.setState('sessionDomain', getSkillDataForProductOutput.sessionDomain);
    api.setState('sessionDomainName', getSkillDataForProductOutput.sessionDomainName);
    api.setState('activateLoaderLabel', getSkillDataForProductOutput.activateLoaderLabel);
    api.setState('deactivateLoaderLabel', getSkillDataForProductOutput.deactivateLoaderLabel);
    api.setState('defaultErrorMessage', getSkillDataForProductOutput.defaultErrorMessage);
    api.setState('activateContent', getSkillDataForProductOutput.activateContent);
    api.setState('deactivateContent', getSkillDataForProductOutput.deactivateContent);
    api.setState('monitorModalHeading', getSkillDataForProductOutput.monitorModalHeading);
    api.setState('product', getSkillDataForProductOutput.product);
    api.setState('features', getSkillDataForProductOutput.features);

    var featuresFaq = getSkillDataForProductOutput.features.map(feature => ({
        ...feature,
        label: `Feature: ${feature.label}`
    }));
    featuresFaq.push({"id":"all","label":"Features: All"});
    api.setState('featuresFaq', featuresFaq);
    api.setState('workflow', getSkillDataForProductOutput.workFlowName);

    api.setState('activateDifferentDomainSkillModalHeading', getSkillDataForProductOutput.activateDifferentDomainSkillModalHeading);
    api.setState('activateDifferentDomainSkillModalDescription', getSkillDataForProductOutput.activateDifferentDomainSkillModalDescription);
    api.setState('activateDifferentDomainSkillModalSubDescription', getSkillDataForProductOutput.activateDifferentDomainSkillModalSubDescription);
    api.setState('turnOnDifferentDomainSkillAlertMessage', getSkillDataForProductOutput.turnOnDifferentDomainSkillAlertMessage)

    api.setState('deActivateDifferentDomainSkillModalHeading', getSkillDataForProductOutput.deActivateDifferentDomainSkillModalHeading);
    api.setState('deActivateDifferentDomainSkillModalDescription', getSkillDataForProductOutput.deActivateDifferentDomainSkillModalDescription);
    api.setState('deActivateDifferentDomainSkillModalSubDescription', getSkillDataForProductOutput.deActivateDifferentDomainSkillModalSubDescription);

    api.setState('copyDifferentDomainSkillModalHeading', getSkillDataForProductOutput.copyDifferentDomainSkillModalHeading);
    api.setState('copyDifferentDomainSkillModalDescription', getSkillDataForProductOutput.copyDifferentDomainSkillModalDescription);
    api.setState('copyDifferentDomainSkillModalSubDescription', getSkillDataForProductOutput.copyDifferentDomainSkillModalSubDescription);

    api.setState('editDifferentDomainSkillModalHeading', getSkillDataForProductOutput.editDifferentDomainSkillModalHeading);
    api.setState('editDifferentDomainSkillModalDescription', getSkillDataForProductOutput.editDifferentDomainSkillModalDescription);
    api.setState('editDifferentDomainSkillModalSubDescription', getSkillDataForProductOutput.editDifferentDomainSkillModalSubDescription);

    api.setState('pageHeading', getSkillDataForProductOutput.title);
    api.setState('breadcrumbs', getSkillDataForProductOutput.breadcrumbs);

    api.setState('installPluginMessage', getSkillDataForProductOutput.installPluginMessage);
    api.setState('hideGetPluginButton', getSkillDataForProductOutput?.hideGetPluginButton);
    api.setState('showAlert', getSkillDataForProductOutput.showAlert);
    api.setState('pluginUrl', getSkillDataForProductOutput.pluginUrl);
    api.setState('summaryData', summary);

    api.setState('overrideSkillLoaderLabel', "Overriding Skill");
    api.setState('duplicatingSkillLoaderLabel', "Duplicating Skill");
    var modalTitle = await helpers.translate("Note, you are deactivating within the domain scope <b>{0}</b>.", getSkillDataForProductOutput.sessionDomainName ? getSkillDataForProductOutput.sessionDomainName : "Global");
    api.setState("bulkDeactivationModalTitles", { ...api.state.bulkDeactivationModalTitles,
        title: modalTitle
    });

    function saveSkillData(skillCardData, skillListData) {
        api.setState('skillCardData', skillCardData);
        api.setState('skillListData', skillListData);
        var {
            skillCardPaginatedData,
            skillListPaginatedData
        } = SkillOperationUtil.setInitialPaginationSkill(skillCardData, skillListData, 0, api.state.cardItemsPerPage, api.state.listItemsPerPage);
        api.setState('skillCardPaginatedData', skillCardPaginatedData);
        api.setState('skillListPaginatedData', skillListPaginatedData);
        var isEnabledRowDefinitions = { ...getSkillDataForProductOutput?.presentationListRowPayload,
            rows : skillListPaginatedData
        };
        api.setState('isEnabledRowDefinitions', isEnabledRowDefinitions);
    }

}
