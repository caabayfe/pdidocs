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
    
    async function sendEmailToAssignedUser(assignedObj) {
        const constants = {
            api: {
                endpoint: {
                    CREATE_EMAIL_RECORD: '/api/now/v1/email',
                },
                methods: {
                    POST: 'POST'
                },
                headers: {
                    POST: {
                        'Content-Type': 'application/json',
                        'X-Custom': 'header'
                    }
                }
            },
            email: {
                subject: 'Guided Setup Task Assigned',
            }
        };
        var assignedToUser = assignedObj.user_name;
        var assignedToEmail = assignedObj.email;

        var assignedByUser = api.context.session.user;
        var assignedByUserId = assignedByUser && assignedByUser.userName;
        assignedByUser = (assignedByUser && assignedByUser.fullName) ? assignedByUser.fullName : assignedByUserId;

        if (!assignedToEmail.trim()) {
            return;
        }
        const {
            translate
        } = helpers;

        var email_subject = await translate(constants.email.subject);
        var task_name = api.state.activityTitle || "";
        var task_page_url = api.state.pageUrl || "";

        const email_body_message = `
        <p>
            ${await translate(`Hi {0}`, assignedToUser)}
            <br/>
            ${await translate(`{0} has assigned a Guided Setup Task`, assignedByUser)}: 
            <strong>${await translate(`{0}`, task_name)} </strong> ${await translate('to you')}.
            <br/>
            ${await translate(`Click`)}  
            <a href='${task_page_url}'> ${await translate('here')} </a>   
            ${await translate('to access and complete the task')}. 
        </p>
    `;

        const email_body_message_text = await translate(`Hi {0}, {1} has assigned a Guided Setup Task: {2} to you. Click link ahead to access and complete the task. Link: ${task_page_url}`, assignedToUser, assignedByUser, task_name);

        helpers.snHttp(constants.api.endpoint.CREATE_EMAIL_RECORD, {
                method: constants.api.methods.POST,
                batch: false,
                headers: constants.api.headers.POST,
                body: {
                    "to": [assignedToEmail],
                    'subject': email_subject,
                    'html': email_body_message,
                    'text': email_body_message_text
                }
            })
            .then(({
                response
            }) => {
                var emailCreated = response && response.result && response.result.id;
                if (emailCreated) {
                    console.log("Guided Setup task assigned");
                }
            })
            .catch(function(error) {
                console.error("Error sending email:", error);
            });


    }
    try {
        helpers.copyUrlToClipboard();
        helpers.timing.setTimeout(function() {
            this.navigator.clipboard.readText().then((data) => {
                api.setState('pageUrl', data);
            });
        });
    } catch (er) {
        console.log("Error while copying URL: ");
    }
    if (event.elementId == "update_record_1") {
        const assignedToObj = event.payload.data.output.data.GlideRecord_Mutation.update_sys_flow_data.assigned_to;
        api.setState('assignedTo', assignedToObj);
        sendEmailToAssignedUser(api.state.selectedUser);

    } else {
        const playbookData = api.data.playbook_custom_layout;
        if (!playbookData) return;
        const {
            selectedActivity,
            selectedPlaybook,
            selectedStage
        } = event.payload;
        const processData = playbookData.playbooksByContextId[selectedPlaybook];
        const laneData = processData && processData.lanes.filter(l => l.contextId == selectedStage);

        if (laneData.length === 0) return;
        const currentActivityData = laneData[0].cards.filter(c => c.contextId == selectedActivity);

        const {
            assignedTo
        } = currentActivityData[0];

        if (assignedTo) {
            api.setState('assignedTo', assignedTo);
            api.setState('selectedUser', assignedTo);
        } else {
            var no_user = {
                value: '',
                displayValue: '',
                email: '',
                user_name: ''
            };
            api.setState('assignedTo', no_user);
            api.setState('selectedUser', no_user);
        }
    }
}
