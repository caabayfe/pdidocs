/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const tabIndex = event.payload.selectedTabIndex;
    api.setState("currentTabIndex", tabIndex);

    switch (tabIndex) {
        case 0:
            resetRecordModal();
            break;
        case 1:
            resetCompareUsersTypeaheads();
            break;
        case 2:
            resetCompareAccessTab();
            break;
    }

    function resetRecordModal() {
        const recordModalClone = { ...api.state.recordModal };
        recordModalClone.tableLabel = null;
        recordModalClone.tableName = null;
        api.setState("recordModal", recordModalClone);        
    }

    function resetCompareUsersTypeaheads() {
        const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
        typeaheadDRBindParamsClone.base_user_typeahead_resources.value = api.state.compareUsersTab.urcBaseUser.typedValue;
        typeaheadDRBindParamsClone.model_user_typeahead_resources.value = api.state.compareUsersTab.urcModelUser.typedValue;
        api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);
        
        api.data.base_user_typeahead_resources.refresh();
        api.data.model_user_typeahead_resources.refresh();
    }

    function resetCompareAccessTab() {
        resetCompareAccessTypeaheads();
        resetRecordModal();
    }

    function resetCompareAccessTypeaheads() {
        const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
        typeaheadDRBindParamsClone.base_user_typeahead_resources.value = api.state.compareAccessTab.uacBaseUser.typedValue;
        typeaheadDRBindParamsClone.model_user_typeahead_resources.value = api.state.compareAccessTab.uacModelUser.typedValue;
        api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);
        
        api.data.base_user_typeahead_resources.refresh();
        api.data.model_user_typeahead_resources.refresh();
    }

}
