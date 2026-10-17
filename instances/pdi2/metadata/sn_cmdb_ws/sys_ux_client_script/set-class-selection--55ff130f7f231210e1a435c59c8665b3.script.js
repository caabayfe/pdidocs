/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        FORM_ICONS,
        navigateToView,
        processSelectedRules
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        WARNING_NOTIFICATION_PROPS,
        showNotification,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const { classHierarchy, sysClassName } = api.context.props;
    const { navButtonState, labelsTooltips } = api.state;

    const classes = api.data?.all_ci_classes?.output?.included?.groups;
    const excludedClasses = api.data?.all_ci_classes?.output?.excluded;
    let invalidClassHierarchy = api.data?.all_ci_classes?.output?.included?.invalidClassHierarchy || false;
    let classHierarchyTableLabel = api.data?.all_ci_classes?.output?.included?.classHierarchyTableLabel;
    const validClassSelected = sysClassName && classes[1].children && classes[1].children.some(item => item.id == sysClassName);
    
    // Class passed in url is an explicitly excluded class
    if (sysClassName && excludedClasses.includes(sysClassName)) {
        helpers.navigate.setRouteParams({'params' : {
            'sysClassName' : ''
        }});

        let notifications = [{
            ...WARNING_NOTIFICATION_PROPS,
            id: 'warningId-exclusion',
            content: await helpers.translate('The {0} class is an excluded class. Please select a valid class to create CI for', [sysClassName])
        }];
        showNotificationWithAutoClose({ api, helpers }, notifications);
    } else if (sysClassName && !validClassSelected) {
        // Class passed in url is not available for selection
        helpers.navigate.setRouteParams({'params' : {
            'sysClassName' : ''
        }});
        const items = [
            {
                ...WARNING_NOTIFICATION_PROPS,
                id: 'warningId-classUnavailable',
                content: await helpers.translate('Provided class name is not available for selection. Please select a class from the dropdown')
            }
        ]
        showNotificationWithAutoClose({api, helpers}, items);
    }

    // Class hierarchy was passed in url but is invalid
    if (classHierarchy && invalidClassHierarchy) {
        helpers.navigate.setRouteParams({'params' : {
            'classHierarchy' : ''
        }});
        if (!validClassSelected) {
            const items = [
                {
                    ...WARNING_NOTIFICATION_PROPS,
                    id: 'warningId-hierarchyInvalid',
                    content: await helpers.translate('Invalid class hierarchy provided. Showing all available classes')
                }
            ]
            showNotificationWithAutoClose({api, helpers}, items);
        }
    }
    
    // No classes available
    if (!classes[1]?.children || classes[1].children.length == 0) {
        let items = [];
        if (classHierarchy && !invalidClassHierarchy) {
            items.push({
                ...WARNING_NOTIFICATION_PROPS,
                id: 'warningId-noWriteAccessHierarchy',
                content: await helpers.translate('You do not have access to create records in any CI class in the given class hierarchy')
            });
        } else {
            items.push({
                ...WARNING_NOTIFICATION_PROPS,
                id: 'warningId-noWriteAccess',
                content: await helpers.translate('You do not have access to create records in any CI class')
            });
        }
        showNotification(arguments[0], items);
    } 

    if (classHierarchyTableLabel) {
        api.setState("mainHeading", await helpers.translate("Create a new {0}", classHierarchyTableLabel));
    } else if (!classHierarchy && !sysClassName) {
        api.setState("mainHeading", "Create a new CI");
    }

    api.setState("allCIClasses", classes);

    let items = [];
    var selectClassObj = {
        id: 'select_class',
        label: await helpers.translate('Select class'),
        focusElementId : "class_selection"
    };

    var reqAttrObj = {
        id: 'required_attributes',
        label: await helpers.translate('Required attributes'),
        focusElementId: "navigation_tree"
    };

    var startingIdx = 0;

    //translate some default initial value strings in client state param
    api.setState("defaultContinueBtnTooltip", await helpers.translate("Show the next form view"));

    if (sysClassName && validClassSelected && !excludedClasses.includes(sysClassName) && (!classHierarchy || invalidClassHierarchy)) {
        selectClassObj = {...selectClassObj, ...FORM_ICONS.DONE};
        reqAttrObj = {...reqAttrObj, ...FORM_ICONS.EDITING};
        startingIdx = 1;        
        api.setState("selectedClass", sysClassName);
        api.setState("tempSelectedClass", sysClassName);
        navButtonState['back']['hidden'] = false;
    } else if (sysClassName && validClassSelected && !excludedClasses.includes(sysClassName) && classHierarchy) {
        selectClassObj = {...selectClassObj, ...FORM_ICONS.EDITING};
        reqAttrObj = {...reqAttrObj, ...FORM_ICONS.LOCKED};       
        api.setState("tempSelectedClass", sysClassName);
        api.setState("selectedClass", sysClassName);
        navButtonState['continue']['disabled'] = false;
        navButtonState['back']['hidden'] = true;
    } else {
        //set to select class tab;
        selectClassObj = {...selectClassObj, ...FORM_ICONS.EDITING};
        reqAttrObj = {...reqAttrObj, ...FORM_ICONS.LOCKED};
        labelsTooltips.continueBtnTooltip = await helpers.translate('Select a class with at least 1 IRE rule to continue.');
        api.setState("tempSelectedClass", '');
        api.setState("selectedClass", classes[0].id);
        navButtonState['continue']['disabled'] = true;
    }

    items.push(
        selectClassObj,
        reqAttrObj,
        {
            id: 'additional_attributes',
            label: await helpers.translate('Additional attributes'),
            focusElementId: "navigation_tree",
            ...FORM_ICONS.LOCKED
        },
        {
            id: 'relationship_definition',
            label: await helpers.translate('Relationship definition'),
            focusElementId: "navigation_tree",
            ...FORM_ICONS.LOCKED
        },
        {
            id: 'review',
            label: await helpers.translate('Review'),
            focusElementId: "navigation_tree",
            ...FORM_ICONS.LOCKED
        }
    );

    navigateToView(items, startingIdx);
    api.setState('navButtonState', navButtonState);
}
