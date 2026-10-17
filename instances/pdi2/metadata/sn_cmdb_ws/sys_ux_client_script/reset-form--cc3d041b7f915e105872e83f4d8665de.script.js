/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        FORM_ICONS,
        navigateToView,
        resetFormExceptSelectClass
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        leftNavItems
    } = api.state;
    helpers.navigate.setRouteParams({'params': {
        sysClassName: ''
    }});
    let newNavItems = leftNavItems.map((item) => {
        if (item.id != 'select_class') {
            item = {
                ...item,
                actionable: false,
                ...FORM_ICONS.LOCKED
            };
        } else if (item.id == 'select_class') {
            item = {
                ...item,
                ...FORM_ICONS.EDITING
            };
        }
        return item;
    });
    navigateToView(newNavItems, 0);
    api.setState('selectedClass', '');
    api.setState('tempSelectedClass', '');
    api.setState('mainHeading', 'Create a new CI');
    api.setState('mainTable', '');
    api.setState('navButtonState', {
        'back': {
            disabled: false,
            hidden: true
        },
        'continue': {
            disabled: true,
            hidden: false
        },
        'create': {
            disabled: false,
            hidden: true
        }
    });
    api.setState('userPayload', {
        attributes: {},
        relations: []
    });
    api.setState('additionalAttrFields', []);
    api.setState('lifeCycleFields', []);
    api.setState('dependencyState', {
        classSelectDisabled: false,
        dependencies: [],
        hideDepCiTypeahead: true,
        selectedDependentCi: null,
        selectedDependentClass: null,
        selectedDependentObj: {}
    });
    api.setState('dependentCiValue', '');
    resetFormExceptSelectClass();
}
