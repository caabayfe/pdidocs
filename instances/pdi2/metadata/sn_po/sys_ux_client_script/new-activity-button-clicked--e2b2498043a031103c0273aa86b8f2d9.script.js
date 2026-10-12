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
    let activityForm = { ...api.state.activityForm
    };
    api.setState('activityForm', {
        fields: {
            groupValues: {
                value: 'separate-unique-values',
                disabled: false,
            },
            hideActivity: {
                value: false,
            },
            name: {
                invalid: false,
                value: '',
            },
            relation: {
                invalid: false,
                listItems: activityForm.fields.relation.listItems,
                selectedValue: null,
                label: null,
                internalType: null,
            },
            displayOrder: {
                invalid: false,
                value: 50,
            },
            type: {
                invalid: false,
                listItems: activityForm.fields.type.listItems,
                selectedValue: 'DEFAULT',
            },
            activityValues: {
                selectedValues: [],
                selectedValuesLabels: [],
            },
            groupedActivityName: {
                value: '',
                invalid: false,
            },
            attachedTableConfiguration: {
                selectedValue: null,
                listItems: [],
                inputValue: '',
                invalid: false,
                disabled: false,
            },
            includeEmptyStartNode: {
                value: false,
            },
            dotWalkMode: false,
            dotWalkInput: {
                value: '',
                invalid: false,
            }
        },
    });

    let currentView = { ...api.state.currentView
    };
    api.setState('activityValues',[]);
    currentView = {
        view: api.state.VIEWS.ACTIVITY_FORM,
        params: {
            mode: 'NEW',
        },
    };

    const filteredActivityRecommendations = api.state.filteredActivityRecommendations.map(item => {
        return { ...item,
            selected: false
        };
    });
    api.setState('filteredActivityRecommendations', filteredActivityRecommendations);
    api.setState('currentView', currentView);
    api.setState('selectedActivityFieldDetails',{});
}
