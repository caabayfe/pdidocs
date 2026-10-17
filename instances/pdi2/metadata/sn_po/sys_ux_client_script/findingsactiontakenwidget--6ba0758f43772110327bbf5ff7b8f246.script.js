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
    // data transformation for action taken
    const model = api.data.fetch_promin_header_state_2.output.data.GlidePromin_Query.scheduleModel;
    const {
        getRootModel,
    } = imports["global.prominUtils"]();

    const {
        rootAggregate: {
            modelId: rootModelId
        },
    } = getRootModel(model);
    api.setState('rootModelId', rootModelId);

    const {
        automationRequestsCount,
        cimInitiatives,
        notes,
        savedFilterSetCount
    } = api.data.fetch_action_taken_widget_data_1.output.data.GlidePromin_Query;

    // If an error occured, or something, then ignore the next
    
    if (!cimInitiatives && !notes)
        return;

    const opportunitiesProgressStatus = {
        automationRequests: {
            assignmentGroup: await helpers.translate("Automation requests"),
            value: automationRequestsCount,
        },
        cim: {
            assignmentGroup: await helpers.translate("CIM"),
            value: cimInitiatives.length || 0,
        },
        notes: {
            assignmentGroup: await helpers.translate("Notes"),
            value: notes.length,
        },
        savedFilterSets: {
            assignmentGroup: await helpers.translate("Saved filter sets"),
            value: savedFilterSetCount,
        },
    };

    const opportunitiesProgressStatusSorted = Object.entries(opportunitiesProgressStatus)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r,
            [k]: v
        }), {});

    const data = Object.values(opportunitiesProgressStatusSorted);

    const elements = data.map((item) => {
        return {
            label: item.assignmentGroup,
            defaultColor: "10, 184, 217"
        };
    });

    const opportunitiesProgressStatusResult = [{
        data,
        metadata: {
            groupBy: [{
                series: [{
                    id: "value",
                    type: "value",
                }],
                elements,
                id: "assignmentGroup",
                fieldType: "reference",
                label: "assignmentGroup",
            }],
            format: {
                unitFormat: "{0}"
            },
        },
    }];

    api.setState('opportunitiesProgressStatusResult', opportunitiesProgressStatusResult);
}
