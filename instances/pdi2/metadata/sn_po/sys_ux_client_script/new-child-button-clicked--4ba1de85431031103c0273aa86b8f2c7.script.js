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
    const { TABLE } = api.state.SOURCE_TYPES;
    let entityListItems = [];

    api.data.get_table_list.execute({
        sourceType: TABLE,
        searchTerm: '',
    });

    const entityForm = {...api.state.entityForm};
    api.setState('entityForm', {
        "fields": {
            "sourceType": {
                "selectedValue": TABLE,
                "listItems": entityForm.fields.sourceType.listItems,
                "invalid": false,
                "disabled": false,
            },
            "entity": {
                "selectedValue": null,
                "listItems": entityListItems,
                "inputValue": "",
                "invalid": false,
                "disabled": false,
            },
            "parentEntity": {
                "selectedValue": null,
                "listItems": entityForm.fields.parentEntity.listItems,
                "invalid": false,
                "sourceType": "",
            },
            "relationType": {
                "selectedValue": null,
                "listItems": entityForm.fields.relationType.listItems,
                "invalid": false
            },
            "relationField": {
                "selectedValue": null,
                "listItems": [],
                "invalid": false
            },
            "sourceField": {
                "selectedValue": null,
                "listItems": [],
                "invalid": false,
                "disabled": true,
            },
            "targetField": {
                "selectedValue": null,
                "listItems": [],
                "invalid": false,
                "disabled": true,
            },
            "filter": {
                "value": ""
            },
            "includeApprovals": {
                "value": false
            },
            "slaBreachAnalysis": {
                "visible":true,
                "value": ""
            }
        },
    });
    api.setState('filterCondition','');
    api.setState('selectedSourceType', TABLE);

    let advancedConditionForm = { ...api.state.advancedConditionForm
    };
    advancedConditionForm.fields.startCondition.id = null;
    advancedConditionForm.fields.startCondition.value = null;
    advancedConditionForm.fields.endCondition.id = null;
    advancedConditionForm.fields.endCondition.value = null;
    advancedConditionForm.fields.transitionConditionType = 'NONE';
    api.setState('advancedConditionForm', advancedConditionForm);

    let currentView = {...api.state.currentView};
    currentView = {
        view: api.state.VIEWS.ENTITY_FORM,
        params: {
            mode: 'NEW',
        },
    };
    api.setState('currentView', currentView);
    api.setState('selectedEntity', {});
    api.setState('hideParentADsWarning', true);
    api.data.get_project_entities.refresh();
    
}
