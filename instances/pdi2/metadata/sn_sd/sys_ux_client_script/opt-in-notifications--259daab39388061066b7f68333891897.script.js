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
    const {
        handleRemoveNotifications
    } = imports["sn_sd.SDNotificationHandler"]();
    const emit = api.emit;
    api.data.get_benchmark_config_1.refresh();
    if (!Object.keys(api.data.toggle_opt_in_status_1.output).length) {

        if (api.state.newOptIn == "false") {
            helpers.modal.close('custom_1');
        }
        api.setState('newOptIn', '');
        api.setState('optOutFeedback', '');
        api.setState('optOutReason', '');
        api.setState('optInCheckBox', false);
        let content1 = await helpers.translate("An error occurred, please try again later");
        let content2 = await helpers.translate("For more information, please refer to {0}", "<a target='_blank' href='https://hi.service-now.com/kb_view.do?sysparm_article=KB0596715'>KB0596715</a>");
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [

                {

                    id: "error_1",
                    status: "critical",
                    icon: "circle-close-outline",
                    content: {
                        "type": "html",
                        "value": "<div>" + content1 + "<br>" + content2 + "</div>"
                    },
                    action: {
                        "type": "dismiss"
                    }

                }

            ]

        });    
        const timeoutId = helpers.timing.setTimeout(() => {
            api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
                items: [{id: 'error_1'}]
            }); 
        }, 10000);

    } else if (api.data.toggle_opt_in_status_1.output.result == "success") {
        if (api.state.newOptIn == "true" || api.state.newOptIn == true) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {

                items: [

                    {

                        id: "success_1",
                        status: "positive",
                        icon: "circle-check-outline",
                        header: await helpers.translate("Opted in."),
                        content: await helpers.translate("Your company has successfully opted in to Benchmarks"),
                        action: {
                            "type": "dismiss"
                        }

                    }

                ]

            });
            handleRemoveNotifications(emit, 'success_1', helpers);

        } else if (api.state.newOptIn == "false" || api.state.newOptIn == false) {
            var feedback = {};
            feedback['reason'] = api.state.optOutReason;
            feedback['sys_id'] = api.state.optOutFeedback;
            api.setState('feedback', "'" + JSON.stringify(feedback) + "'");
            api.setState('newOptIn', '');
            api.setState('optOutFeedback', '');
            api.setState('optOutReason', '');
            api.setState('optInCheckBox', false);
            helpers.modal.close('custom_1');
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {

                items: [

                    {

                        id: "success_2",
                        status: "positive",
                        icon: "circle-check-outline",
                        header: await helpers.translate("Opted out!"),
                        content: await helpers.translate("Your company has opted out of ServiceNow Benchmarks. Changed your mind? Opt in below."),
                        action: {
                            "type": "dismiss"
                        }

                    }

                ]

            });
        handleRemoveNotifications(emit, 'success_2', helpers);

        }

    }
}
