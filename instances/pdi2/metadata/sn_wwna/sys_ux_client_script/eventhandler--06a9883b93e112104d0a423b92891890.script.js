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
    let selectedButtonConfig = api.state.selectedButtonConfig;
    let tabsDataArray = api.state.tabs;

    function reformatAndSaveTabData(tabsData, selectedTabData) {
        selectedTabData = JSON.parse(JSON.stringify(selectedTabData));
        let currentIndex = selectedTabData.index;
        tabsData[currentIndex] = selectedTabData;
        return tabsData;
    }

    function setTabData(tabs, eventPayload) {
        let isTabListUpdated = false;
        let tabIndex = eventPayload.selectedTabIndex;
        let tabId = eventPayload.selectedTab || `id=button_list^index=${tabIndex}`;
        let currentSelectedTabIndex = api.state.selectedTabIndex;
        if (currentSelectedTabIndex === tabIndex) {
            return;
        }
        if (Number.isInteger(currentSelectedTabIndex)) {
            isTabListUpdated = true;
            reformatAndSaveTabData(tabs, api.state.selectedButtonConfig);
        }
        let tempConfig = api.state.nacmConfig;
        api.setState('nacmConfig', {active: false});
        let tempTabObj = JSON.parse(JSON.stringify(tabs[tabIndex]));

        if (isTabListUpdated) {
            api.setState('tabs', tabs);
        }
        api.setState('selectedButtonConfig', tempTabObj);
        api.setState('selectdTabId', tabId);
        api.setState('selectedTabIndex', tabIndex);
        api.setState('nacmConfig', JSON.parse(JSON.stringify(tempConfig)));

    }

    let dataFieldsArr = [];
    switch (event.elementId) {
        case "fetch_records_list":
            let configOutput = api.data.fetch_records_list.results;
            let tempRecordListArr = [];
            dataFieldsArr = (api.state.dataFieldList || '').split(',');

            configOutput.forEach((obj) => {
                let newObj = {};
                dataFieldsArr.forEach((fieldKey) => {
                    if (obj[fieldKey].value) {
                        if (fieldKey === 'sys_id') {
                            newObj['id'] = obj[fieldKey].value;
                        } else {
                            if (!newObj['label']) {
                                newObj['label'] = obj[fieldKey].value;
                            } else {
                                newObj['label'] = (newObj.label + '-' + obj[fieldKey].value);
                            }

                        }
                    }
                });
                if (newObj['id'] && newObj['label']) {
                    tempRecordListArr.push(newObj);
                }
            });
            if (api.state.generalDetails.props.config_type === 'single_occurence') {
                setTabData(api.state.tabs, {
                    selectedTabIndex: 0
                });
            }
            api.setState('recordList', tempRecordListArr);
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false,
                label: '',
                action: null,
                nonBlocking: false
            });
            break;
        case "tabs_2":
            setTabData(api.state.tabs, event.payload);
            break;
        case "fetch_display_field":
            let displayFieldOutput = api.data.fetch_display_field.output;
            let dataFieldListArr = ['sys_id'];
            if (displayFieldOutput.success && displayFieldOutput.displayField) {
                if (typeof displayFieldOutput.displayField === 'string') {
                    dataFieldListArr.push(displayFieldOutput.displayField);
                } else if (Array.isArray(displayFieldOutput.displayField)) {
                    dataFieldListArr = [...dataFieldListArr, ...displayFieldOutput.displayField];
                }
            }
            api.setState('dataFieldList', dataFieldListArr.join(','));
            api.setState('tableName', api.state.generalDetails?.props?.table);
            break;
        case "record_list":
            if (event.name === "NOW_SELECT#SEARCH_TERM_SET") {
                let searchText = event?.payload?.value;
                let searchTerm = '';
                if (searchText) {
                    dataFieldsArr = (api.state.dataFieldList || '').split(',');
                    dataFieldsArr.forEach((fieldKey) => {
                        if (fieldKey !== 'sys_id') {
                            if (searchTerm) {
                                searchTerm += ('^OR');
                            }
                            searchTerm += `${fieldKey}LIKE${searchText}`;
                        }
                    });
                }

                api.setState('searchQuery', searchTerm);
            } else if (event.name === "NOW_SELECT#SELECTED_ITEM_SET") {
                let selectedRecordObj = event?.payload?.item || {
                    id: ""
                };
                api.setState('selectedRecord', selectedRecordObj);
                api.setState('nacmConfig', {active:false});
            }
            break;
        case "fetch_nacm_configuration":
            const tempNacmConfig = api.data.fetch_nacm_configuration.output;
            if (tempNacmConfig) {
                tempNacmConfig.active = true;
                api.setState('nacmConfig', JSON.parse(JSON.stringify(tempNacmConfig)));
            }
            api.setState('buttonClicked', false);
            break;
        case "preview_button":
            api.setState('buttonClicked', true);
            break;
    }
}
