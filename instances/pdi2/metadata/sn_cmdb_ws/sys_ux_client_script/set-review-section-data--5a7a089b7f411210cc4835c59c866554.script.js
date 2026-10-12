/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        WARNING_NOTIFICATION_PROPS,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();

    const { 
        getRelRowDefinitions,
        REL_DEF_LIST_DEFAULT,
        FORM_ICONS,
        markCurrStepDone
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);

    const {
        buildFieldMetadata,
        getReferenceFieldRoute,
        FIELD_TYPES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
        
    let {
        userPayload, 
        leftNavItems,
        selectedTabId,
        relProps: {
            relationships
        },
        reviewData
    } = api.state;

    if (selectedTabId == "relationship_definition") {
        const {
            isDependent
        } = api.data.get_class_details.result;

        let currentViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
        let relations = userPayload.relations.concat(relationships);
        userPayload.relations = relations;

        let dependentCIInfoData = [];

        if (isDependent) {
            let dependentCIInfo = [];
            let relations = userPayload.relations;
            relations.filter(rel => rel.isDependentRel == true);

            let item = {};
            item.label = await helpers.translate("Class");
            item.displayValue = relations[0].classLabel;
            let metadata = buildFieldMetadata(item);
            dependentCIInfoData.push(metadata);

            item = {};
            item.label = await helpers.translate("CI");
            item.displayValue = relations[0].ciLabel;
            metadata = buildFieldMetadata(item);
            dependentCIInfoData.push(metadata);

            item = {};
            item.label = await helpers.translate("Relationship type");
            item.displayValue = relations[0].relationshipType;
            metadata = buildFieldMetadata(item);
            dependentCIInfoData.push(metadata);
        }  else if (userPayload.relations && userPayload.relations == 0) {
            let notifications = [{
                ...WARNING_NOTIFICATION_PROPS,
                id: 'warningId' + new Date().valueOf(),
                content: await helpers.translate('This CI is missing relationships to other CIs. If created, it will be an orphan CI and impact CMDB health')
            }];
            showNotificationWithAutoClose({ api, helpers }, notifications);
        }

        let reqAttrsNonLookupRulesData = [];
        let reqAttrsLookupRulesData = [];
        let additionalAttrsData = [];
        Object.keys(userPayload.attributes).forEach(table => {
            let lookup = userPayload.attributes[table].lookup;
            let fields = userPayload.attributes[table].fields;
            let additionalFields = userPayload.attributes[table].additionalFields;

            if(Object.keys(fields).length > 0) {
                if(lookup == true) {
                    let objArray = [];
                    fields.forEach((fieldInfo, index) => {
                        let tableInfo = {};
                        tableInfo.fields = [];
                        tableInfo.heading = {
                            hidden: false,
                            text: userPayload.attributes[table].tableLabel
                        };

                        if (index > 0) {
                            tableInfo.heading.hidden = true;
                        }
                        Object.keys(fieldInfo).forEach(field => {
                            let item = {};
                            item.label = fieldInfo[field].label;
                            item.displayValue = fieldInfo[field].displayValue ? fieldInfo[field].displayValue : fieldInfo[field].value;
                            if (fieldInfo[field].internalType === FIELD_TYPES.REFERENCE && !fieldInfo[field].referenceKey) {
                                var referenceRoute = getReferenceFieldRoute(field, fieldInfo[field]);
                                if (referenceRoute) {
                                    item.reference = referenceRoute;
                                }
                            }

                            let metadata = buildFieldMetadata(item);
                            tableInfo.fields.push(metadata);
                        });
                        reqAttrsLookupRulesData.push(tableInfo);
                    });
                } else {
                    let tableInfo = {};
                    tableInfo.fields = [];
                    tableInfo.heading = {
                        hidden: false,
                        text: userPayload.attributes[table].tableLabel
                    };
                    Object.keys(fields).forEach(field => {
                        let item = {};
                        item.label = fields[field].label;
                        item.displayValue = fields[field].displayValue ? fields[field].displayValue : fields[field].value;
                        item.value = fields[field].value;

                        if (fields[field].internalType === FIELD_TYPES.REFERENCE && !fields[field].referenceKey) {
                            var referenceRoute = getReferenceFieldRoute(field, fields[field]);
                            if (referenceRoute) {
                                item.reference = referenceRoute;
                            }
                        }

                        let metadata = buildFieldMetadata(item);
                        tableInfo.fields.push(metadata);
                    });
                    reqAttrsNonLookupRulesData.push(tableInfo);
                }
            }

            if(additionalFields && Object.keys(additionalFields).length > 0) {
                let tableInfo = {};
                tableInfo.fields = [];
                Object.keys(additionalFields).forEach(field => {
                    let item = {};
                    item.label = additionalFields[field].label;
                    item.displayValue = additionalFields[field].displayValue ? additionalFields[field].displayValue : additionalFields[field].value;
                    item.value = additionalFields[field].value;

                    if (additionalFields[field].internalType === FIELD_TYPES.REFERENCE && !additionalFields[field].referenceKey) {
                        var referenceRoute = getReferenceFieldRoute(field, additionalFields[field]);
                        if (referenceRoute) {
                            item.reference = referenceRoute;
                        }
                    }

                    let metadata = buildFieldMetadata(item);
                    tableInfo.fields.push(metadata);
                });
                additionalAttrsData.push(tableInfo);
            }
        });

        api.setState('reviewData', ({currentValue}) => ({
            ...currentValue,
            dependentCIInfo: dependentCIInfoData,
            reqAttrsNonLookupRules: reqAttrsNonLookupRulesData,
            reqAttrsLookupRules: reqAttrsLookupRulesData,
            additionalAttrs: additionalAttrsData
        }));
        
        let rows = getRelRowDefinitions(relationships, REL_DEF_LIST_DEFAULT.SELECTED_PAGE, REL_DEF_LIST_DEFAULT.PAGE_SIZE);
        api.setState('relProps', {
            ...api.state.relProps,
            rowDefinitions: {
                rows
            },
            selectedPage: REL_DEF_LIST_DEFAULT.SELECTED_PAGE,
            pageSize: REL_DEF_LIST_DEFAULT.PAGE_SIZE
        });
        markCurrStepDone(leftNavItems, currentViewIndex, FORM_ICONS);
    }
}
