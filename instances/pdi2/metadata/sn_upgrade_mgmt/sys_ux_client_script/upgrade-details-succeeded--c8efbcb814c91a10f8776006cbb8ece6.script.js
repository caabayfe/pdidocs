/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api?.data?.upgrade_management___get_upgrade_details_1?.output) {
        const response = api.data?.query_help_user_interaction_table?.results;
        let selectedGuidedSetup =  response[0];
        const mappedResponse = response?.map(el => {
            if(api?.context?.props?.patch?.split("|||")[0] && api?.context?.props?.patch?.split("|||")[0] === el?.sys_id?.value) {
                selectedGuidedSetup = el;
            }
            return {
                id: el?.sys_id?.value,
                label: el?.setup_name?.value
            }
        });

        const responseData = api?.data?.upgrade_management___get_upgrade_details_1?.output;
        const {upgradeMonitorStatusProviderDetails, upgradeOverviewDetails} = responseData;
        const parsedAvailableFamilyReleases = upgradeOverviewDetails?.availableFamilyReleases && JSON.parse(upgradeOverviewDetails?.availableFamilyReleases);
        const familyReleasesCopy = parsedAvailableFamilyReleases?.map(el => el?.toLowerCase());
        const dropdownOptions = mappedResponse;
        dropdownOptions?.filter(el => {
            return familyReleasesCopy?.includes(el?.label?.toLowerCase());
        });
        api.setState("guidedSetups", dropdownOptions);
        if(!dropdownOptions || dropdownOptions?.length === 0) api?.setState("selectedGuidedSetup", "");
        else api.setState("selectedGuidedSetup",selectedGuidedSetup);
    }
    api.setState("loading", 0);
}
