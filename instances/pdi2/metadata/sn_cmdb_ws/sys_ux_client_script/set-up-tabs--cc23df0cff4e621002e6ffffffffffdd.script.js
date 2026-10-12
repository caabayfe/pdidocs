/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const tabLabel = await helpers.translate("Certification tasks");
    const tabKey = "certification_tasks";
    const tabName = "tasksTab";

    let instanceTabs = {
        "tasksTab": [{
            key: "certification_tasks",
            label: await helpers.translate("Certification tasks")
        }],
        "recordsTab": [{
            key: "certification_records",
            label: await helpers.translate("Certification records")
        }]
    };

    api.setState('instanceTabs', ({ currentValue }) => ({
        ...currentValue,
        ...instanceTabs
    }));
}
