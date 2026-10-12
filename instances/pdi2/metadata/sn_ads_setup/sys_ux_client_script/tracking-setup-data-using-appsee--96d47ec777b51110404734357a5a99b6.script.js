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
    if (event.payload.data.output.data.GlideRecord_Mutation.update_help_guidance != null) {
        const setup_data = api.data.get_setup_summary_1.output.result.setup;
        let table = 0,
            iframe = 0,
            links = 0,
            plugins = 0,
            basic = 0,
            recommended = 0,
            advanced = 0;
        for (let i = 0; i < setup_data.tasks.length; i++) {
            switch (setup_data.tasks[i].configuration_types) {
                case "table":
                    table = table + 1;
                    break;
                case "iframe":
                    iframe = iframe + 1;
                    break;
                case "custom":
                    links = links + 1;
                    break;
                case "install_plugin":
                    plugins = plugins + 1;
                    break;

            }
            switch (setup_data.tasks[i].task_type) {
                case "basic":
                    basic = basic + 1;
                    break;
                case "recommended":
                    recommended = recommended + 1;
                    break;
                case "advanced":
                    advanced = advanced + 1;
                    break;

            }

        }

        // api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        //     event: "Guided Setup - Builder Tool Usage",
        //     value: {
        //         "Setup ID": setup_data.setupID,
        //         "No of tasks in Basic": basic,
        //         "No of tasks in Recommended": recommended,
        //         "No of tasks in Advanced": advanced,
        //         "No of table tasks": table,
        //         "No of iframe tasks": iframe,
        //         "No of external link tasks": links,
        //         "No of plugins tasks": plugins

        //     }
        // });
    }
}
