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

    function success() {
        api.data.glide_form_1.nowRecordFormBlob.gForm.save();
        var guestSessionId = api.context.props.guestSessionIdentifier != null ? api.context.props.guestSessionIdentifier : "";
        var messageId = "";
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 20; i++) {
            messageId += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        var requestBody = {
            "type": "consumerTextMessage",
            "data": {
                "richControl": {
                    "input": true,
                    "model": {
                        "name": api.context.props.nodeVariable,
                        "type": "field"
                    },
                    "richControl": {
                        "nluTextEnabled": false,
                        "uiType": "Picker",
                        "uiMetadata": {
                            "openByDefault": true,
                            "itemType": "ID",
                            "maskType": "NONE",
                            "paginationBreak": 10,
                            "options": [{
                                    "label": "I don't want to fill out the form.",
                                    "value": "form_choice_1",
                                    "enabled": false,
                                    "renderStyle": "data"
                                },
                                {
                                    "label": "I'm done.",
                                    "value": "form_choice_2",
                                    "enabled": false,
                                    "renderStyle": "data"
                                }
                            ],
                            "totalSearchResultsCount": 0,
                            "style": "list",
                            "label": "What would you like to do now?",
                            "totalOptionsCount": 2,
                            "required": true,
                            "multiSelect": false
                        },
                        "model": {
                            "name": api.context.props.nodeVariable,
                            "type": "field"
                        }
                    },
                    "uiType": "Picker",
                    "uiMetadata": {
                        "openByDefault": true,
                        "itemType": "ID",
                        "maskType": "NONE",
                        "paginationBreak": 10,
                        "options": [{
                                "label": "I don't want to fill out the form.",
                                "value": "form_choice_1",
                                "enabled": false,
                                "renderStyle": "data"
                            },
                            {
                                "label": "I'm done.",
                                "value": "form_choice_2",
                                "enabled": false,
                                "renderStyle": "data"
                            }
                        ],
                        "totalSearchResultsCount": 0,
                        "style": "list",
                        "label": "What would you like to do now?",
                        "totalOptionsCount": 2,
                        "required": true,
                        "multiSelect": false
                    },
                    "value": "form_choice_2",
                    "responseContent": "I'm done.",
                    "taskId": api.context.props.taskId,
                    "sessionId": api.context.props.sessionId,
                    "class": ".MessageDto",
                    "direction": "outbound",
                    "conversationId": api.context.props.conversationId,
                    "messageId": messageId
                },
                "taskId": api.context.props.taskId,
                "sessionId": api.context.props.sessionId,
                "class": ".MessageDto",
                "conversationId": api.context.props.conversationId,
                "messageId": messageId,
                "sender": {
                    "sysId": api.context.props.requestedFor
                },
                "direction": "inbound",
                "newVariables":{
                  "newRecordSysId": api.data.glide_form_1.nowRecordFormBlob.sysId
                },
                "sendTime": new Date().getTime()
            },
            "nodeVariable": api.context.props.nodeVariable,
            "source": "uib"
        };
        helpers
            .snHttp("api/now/cs_message", {
                method: "POST",
                body: requestBody,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "amb-channel": "/cs/messages/" + api.context.props.sessionId,
                    "guest_session_identifier": guestSessionId
                }
            })
            .then(({
                response
            }) => {
                helpers.navigate.to("form-acknowledgement", {
                    status: "success"
                });
            })
            .catch(({
                error
            }) => {
                helpers.navigate.to("form-acknowledgement", {
                    status: "success"
                });
            });
    };

    function failure() {
        api.data.glide_form_1.nowRecordFormBlob.gForm.addErrorMessage("Please make sure all fields are entered properly");
    };
    api.data.glide_form_1.nowRecordFormBlob.gForm.validateFormAsync().then(success, failure);
}
