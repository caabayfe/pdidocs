/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const botAvatar = api.data.bot_profile_photo_source.output.data.GlideRecord_Query.live_profile._results.0.photo.displayValue;
    var payload = {
        "messages": [{
            "@class": "com.glide.cs.qlue.actions.systemAction.ActionMessageDto",
            "actionMessage": {
                "showGreeting": true,
                "systemActionName": "TopicFinished",
                "type": "TopicFinished"
            },
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920162000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "2e207e831b72f010bc0b2063b24bcb2f",
            "queueMsgDataType": "actionMessage",
            "receiveTime": 0,
            "sendTime": 1632920162000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a04f430000001",
            "serialNumber": 18,
            "taskId": "2cef2a831b72f010bc0b2063b24bcb47",
            "validationErrorMessage": ""
        }, {
            "@class": "com.glide.cs.qlue.actions.systemAction.ActionMessageDto",
            "actionMessage": {
                "type": "Separator"
            },
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920162000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "aa207e831b72f010bc0b2063b24bcb2e",
            "queueMsgDataType": "actionMessage",
            "receiveTime": 0,
            "sendTime": 1632920162000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a04f370000001",
            "serialNumber": 17,
            "taskId": "2cef2a831b72f010bc0b2063b24bcb47",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920160000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "ca203e831b72f010bc0b2063b24bcbb0",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "fieldAck.__silent_OutputPrompt_8d50a162291448b890a6f6f3e02596a4",
                    "type": "outputMsg"
                },
                "uiMetadata": {
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "OutputText",
                "value": "Thank you for using our support chat."
            },
            "sendTime": 1632920162000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a047420000001",
            "serialNumber": 15,
            "taskId": "82203e831b72f010bc0b2063b24bcbb0",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920158000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "bd203e831b72f010bc0b2063b24bcb8b",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "fieldAck.__silent_OutputPrompt_3ec2f08b91524624abdcae0f3ecd059b",
                    "type": "outputMsg"
                },
                "uiMetadata": {
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "OutputText",
                "value": "UR0010035"
            },
            "sendTime": 1632920162000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a041760000001",
            "serialNumber": 13,
            "taskId": "9120fa831b72f010bc0b2063b24bcbb1",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920158000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "71203e831b72f010bc0b2063b24bcb8b",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "fieldAck.__silent_OutputPrompt_a603ca64f47b493f823f503222eae588",
                    "type": "outputMsg"
                },
                "uiMetadata": {
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "OutputText",
                "value": "Got it. I submitted your request and someone will be assigned to it soon."
            },
            "sendTime": 1632920162000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a041530000001",
            "serialNumber": 12,
            "taskId": "9120fa831b72f010bc0b2063b24bcbb1",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920156000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ii09300203c6og9ey217a",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920156000,
            "richControl": {
                "model": {
                    "name": "need_further_help",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Would you like to open an IT ticket to get further help?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean",
                "value": true
            },
            "sendTime": 1632920156000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c31a038cc0000001",
            "serialNumber": 0,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920150000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "7b10ba831b72f010bc0b2063b24bcb85",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "need_further_help",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Would you like to open an IT ticket to get further help?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean"
            },
            "sendTime": 1632920150000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a0235d0000001",
            "serialNumber": 11,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920150000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ihvtu001s3c6o3xnkitr3",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920150000,
            "richControl": {
                "model": {
                    "name": "did_articles_help",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Did any of this information resolve your issue?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean",
                "value": false
            },
            "sendTime": 1632920150000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c31a022850000001",
            "serialNumber": 0,
            "taskId": "f9103a831b72f010bc0b2063b24bcb8e",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920144000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "5a10fa831b72f010bc0b2063b24bcb16",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "did_articles_help",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Did any of this information resolve your issue?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean"
            },
            "sendTime": 1632920144000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a0092d0000001",
            "serialNumber": 10,
            "taskId": "f9103a831b72f010bc0b2063b24bcb8e",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920144000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "de10fa831b72f010bc0b2063b24bcb15",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "fieldAck.__silent_LinkOutputPrompt_3434270463614ab296d3088492899bdd",
                    "type": "outputMsg"
                },
                "uiMetadata": {
                    "groupedPartType": "Link",
                    "header": "Showing results 1 to 1 of 1",
                    "type": "link"
                },
                "uiType": "GroupedPartsOutputControl",
                "value": [{
                    "@class": "com.glide.cs.qlue.dto.rc.LinkControl$LinkValue",
                    "action": "",
                    "context": "Knowledge",
                    "description": "How to configure VPN for Apple Devices For an iPhone or iPad running iOS? Select Settings General VPN.= Click Add VPN Configuration and enter the following information: Select L2TP. Enter",
                    "label": "How to configure VPN for Apple Devices"
                }]
            },
            "sendTime": 1632920144000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c31a0090e0000001",
            "serialNumber": 9,
            "taskId": "f9103a831b72f010bc0b2063b24bcb8e",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920142000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ihpfm001g3c6ohleic64o",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920142000,
            "richControl": {
                "model": {
                    "name": "steps_were_helpful",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Did these steps work for you?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean",
                "value": false
            },
            "sendTime": 1632920142000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c31a0020f0000001",
            "serialNumber": 0,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920138000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "bc107a831b72f010bc0b2063b24bcb6e",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "steps_were_helpful",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "formatType": "text",
                    "label": "Did these steps work for you?",
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "required": true,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Boolean"
            },
            "sendTime": 1632920138000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319ff1710000001",
            "serialNumber": 8,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920138000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ihlu900183c6ozoo6o99o",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920138000,
            "richControl": {
                "model": {
                    "name": "mac_instruction_2",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "itemType": "ID",
                    "label": "Please try these steps first",
                    "maskType": "NONE",
                    "multiSelect": false,
                    "openByDefault": true,
                    "options": [{
                        "enabled": false,
                        "label": "Click the VPN icon on your desktop.",
                        "renderStyle": "data",
                        "value": "1"
                    }, {
                        "enabled": false,
                        "label": "Click Connect",
                        "renderStyle": "data",
                        "value": "2"
                    }, {
                        "enabled": false,
                        "label": "Enter your user name and PIN",
                        "renderStyle": "data",
                        "value": "3"
                    }],
                    "paginationBreak": 10,
                    "required": true,
                    "style": "list",
                    "totalOptionsCount": 3,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Picker",
                "value": "3"
            },
            "sendTime": 1632920137000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c319ff1230000001",
            "serialNumber": 0,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920122000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "b4003a831b72f010bc0b2063b24bcb8a",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "mac_instruction_2",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "itemType": "ID",
                    "label": "Please try these steps first",
                    "maskType": "NONE",
                    "multiSelect": false,
                    "openByDefault": true,
                    "options": [{
                        "enabled": false,
                        "label": "Click the VPN icon on your desktop.",
                        "renderStyle": "data",
                        "value": "1"
                    }, {
                        "enabled": false,
                        "label": "Click Connect",
                        "renderStyle": "data",
                        "value": "2"
                    }, {
                        "enabled": false,
                        "label": "Enter your user name and PIN",
                        "renderStyle": "data",
                        "value": "3"
                    }],
                    "paginationBreak": 10,
                    "required": true,
                    "style": "list",
                    "totalOptionsCount": 3,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Picker"
            },
            "sendTime": 1632920122000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319fb2b00000001",
            "serialNumber": 7,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920121000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ih9ej00103c6ozoo55cvo",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920121000,
            "richControl": {
                "model": {
                    "name": "user_machine",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "itemType": "ID",
                    "label": "What kind of computer do you have?",
                    "maskType": "NONE",
                    "multiSelect": false,
                    "openByDefault": true,
                    "options": [{
                        "enabled": false,
                        "label": "Mac",
                        "renderStyle": "data",
                        "value": "mac"
                    }, {
                        "enabled": false,
                        "label": "PC",
                        "renderStyle": "data",
                        "value": "pc"
                    }],
                    "paginationBreak": 10,
                    "required": true,
                    "style": "list",
                    "totalOptionsCount": 2,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Picker",
                "value": "mac"
            },
            "sendTime": 1632920121000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c319fb2490000001",
            "serialNumber": 0,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920115000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "dfff6a831b72f010bc0b2063b24bcb6a",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "user_machine",
                    "type": "field"
                },
                "nluTextEnabled": false,
                "uiMetadata": {
                    "itemType": "ID",
                    "label": "What kind of computer do you have?",
                    "maskType": "NONE",
                    "multiSelect": false,
                    "openByDefault": true,
                    "options": [{
                        "enabled": false,
                        "label": "Mac",
                        "renderStyle": "data",
                        "value": "mac"
                    }, {
                        "enabled": false,
                        "label": "PC",
                        "renderStyle": "data",
                        "value": "pc"
                    }],
                    "paginationBreak": 10,
                    "required": true,
                    "style": "list",
                    "totalOptionsCount": 2,
                    "totalSearchResultsCount": 0
                },
                "uiType": "Picker"
            },
            "sendTime": 1632920115000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319f99e50000001",
            "serialNumber": 6,
            "taskId": "dfff6a831b72f010bc0b2063b24bcb69",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920115000,
            "direction": "inbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "cku5ih4f3000r3c6opek6m171",
            "queueMsgDataType": "consumerTextMessage",
            "receiveTime": 1632920115000,
            "richControl": {
                "model": {
                    "type": "topic"
                },
                "nluTextEnabled": false,
                "searchText": "VPN connectivity",
                "uiMetadata": {
                    "categories": [{
                        "@class": ".TopicPickerControl$Category",
                        "label": " ",
                        "options": [{
                            "@class": ".TopicPickerControl$Option",
                            "label": "AA control",
                            "promoted": false,
                            "value": "f9bdb5f81b8af010bc0b2063b24bcbfe"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "acme",
                            "promoted": false,
                            "value": "c1e8acbf1b497010bc0b2063b24bcb83"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "all controls 2",
                            "promoted": false,
                            "value": "8357e4351b497410bc0b2063b24bcb61"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "all controls 3",
                            "promoted": false,
                            "value": "031539021b0db410bc0b2063b24bcb05"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Allcontrols",
                            "promoted": false,
                            "value": "2efb1e451bc13010bc0b2063b24bcbb4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "aSkippableControl",
                            "promoted": false,
                            "value": "8c03adeb1bf83010bc0b2063b24bcbac"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "boolean",
                            "promoted": false,
                            "value": "e95616411bc13010bc0b2063b24bcbe6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "card info",
                            "promoted": false,
                            "value": "a1ac933b1bb83010bc0b2063b24bcb85"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cardop",
                            "promoted": false,
                            "value": "28985bab1b417010bc0b2063b24bcb17"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cardop2",
                            "promoted": false,
                            "value": "124228771b497010bc0b2063b24bcb7e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "carousel",
                            "promoted": false,
                            "value": "15b1964d1b813010bc0b2063b24bcbc7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Change Password (Template)",
                            "promoted": false,
                            "value": "07811ecdc7d310100a9b5d83c7c2602d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cisco",
                            "promoted": false,
                            "value": "4b78a0bf1b497010bc0b2063b24bcb9b"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Company Gift Program",
                            "promoted": false,
                            "value": "0c6ae7761bf6b010bc0b2063b24bcba3"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "CustomcontrolTopic",
                            "promoted": false,
                            "value": "a722bab31b383010bc0b2063b24bcb73"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "default values",
                            "promoted": false,
                            "value": "d4cc23411bc93010bc0b2063b24bcbff"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "deflection test",
                            "promoted": false,
                            "value": "62a157a71b853410d7a765b3b24bcbae"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "EmojiandTable",
                            "promoted": false,
                            "value": "8b02bdc11bcd7410bc0b2063b24bcbe4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "fdih action",
                            "promoted": false,
                            "value": "5ede77eb1bc93410d7a765b3b24bcbb6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "FilePicker",
                            "promoted": false,
                            "value": "d1075adf1b45b410bc0b2063b24bcbd5"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Flight Booking",
                            "promoted": false,
                            "value": "3832c7ce1b09f010d7a765b3b24bcba4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "google",
                            "promoted": false,
                            "value": "5e1f68321bed3010bc0b2063b24bcb03"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "greeting message",
                            "promoted": false,
                            "value": "c40eec131bf57410935ca869b04bcb6c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "haha",
                            "promoted": false,
                            "value": "4a85a0bb1b497010bc0b2063b24bcbc0"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Hardware Issues",
                            "promoted": false,
                            "value": "db28eb341b2db010935ca869b04bcb3f"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Hardware Issues (Template)",
                            "promoted": false,
                            "value": "7670c3ce073220109c3e59bf1ad3007e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "html",
                            "promoted": false,
                            "value": "99e588d51b417010bc0b2063b24bcb9a"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image broken",
                            "promoted": false,
                            "value": "583296721b257010bc0b2063b24bcbdf"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image gif , png, svg",
                            "promoted": false,
                            "value": "dced02be1be17010bc0b2063b24bcb9c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image input op",
                            "promoted": false,
                            "value": "94630f3b1bf03010d7a765b3b24bcb3d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image output",
                            "promoted": false,
                            "value": "4844a68d1bc13010bc0b2063b24bcb43"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image output high",
                            "promoted": false,
                            "value": "102582b61be17010bc0b2063b24bcb68"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Link and multilink",
                            "promoted": false,
                            "value": "c6273bc11b4d3010bc0b2063b24bcb00"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Live Agent Support.",
                            "promoted": false,
                            "value": "ce2ee85053130010cf8cddeeff7b12bf"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "multi flow",
                            "promoted": false,
                            "value": "871cb7091b8d3010bc0b2063b24bcb94"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Multiflow output control",
                            "promoted": false,
                            "value": "7ab19c551b06f810935ca869b04bcb8d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "multilinkcard",
                            "promoted": false,
                            "value": "e690e2c91bc13010bc0b2063b24bcbfb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Open IT Ticket",
                            "promoted": false,
                            "value": "558218951b06f810935ca869b04bcb62"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Open It Ticket (Testing)",
                            "promoted": false,
                            "value": "afdf06a21b55fc10d7a765b3b24bcb38"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Order Item",
                            "promoted": false,
                            "value": "a1adf68a1b09f010d7a765b3b24bcbcb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Printer Issues",
                            "promoted": false,
                            "value": "aca27b451ba9f010935ca869b04bcb6e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "public",
                            "promoted": false,
                            "value": "7db0e3931b81f010d7a765b3b24bcb95"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "rahul - picker",
                            "promoted": false,
                            "value": "296e76de1b093410d7a765b3b24bcb54"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "record card",
                            "promoted": false,
                            "value": "8b34eafe1b257010bc0b2063b24bcb9f"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "reference choice",
                            "promoted": false,
                            "value": "a996cbfb1bf03010d7a765b3b24bcb09"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "reference choice test",
                            "promoted": false,
                            "value": "6ee9e2c21bc5f010d7a765b3b24bcba4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "RSA Token (Template)",
                            "promoted": false,
                            "value": "6b2641b0c30120105ae0d2bf6d40ddfb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "script output",
                            "promoted": false,
                            "value": "77fdf3c11bcd3010bc0b2063b24bcbb2"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Service Disruption",
                            "promoted": false,
                            "value": "beb967c91b69f010935ca869b04bcb86"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "small image",
                            "promoted": false,
                            "value": "7c5676b31b75f410935ca869b04bcbb3"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "SMScontrols2",
                            "promoted": false,
                            "value": "0b7693e71b417010bc0b2063b24bcb68"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "static choice 3",
                            "promoted": false,
                            "value": "592564b61bad3010bc0b2063b24bcb5c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "table 2",
                            "promoted": false,
                            "value": "33c1f43f1b897010bc0b2063b24bcbe7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "table op",
                            "promoted": false,
                            "value": "660c5bf71bb83010bc0b2063b24bcb34"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "test carousel",
                            "promoted": false,
                            "value": "e1faedb11b4d7410bc0b2063b24bcba2"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "TestMyControls",
                            "promoted": false,
                            "value": "b47c03d51b8db010bc0b2063b24bcb44"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text control",
                            "promoted": false,
                            "value": "b2bb43161b893410d7a765b3b24bcb44"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text ip op",
                            "promoted": false,
                            "value": "205a42311b49b010d7a765b3b24bcb0d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text op",
                            "promoted": false,
                            "value": "d8ef3d751b8d7410bc0b2063b24bcb61"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "top",
                            "promoted": false,
                            "value": "22a9a0331b897010bc0b2063b24bcbec"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "UpdateIncidentTest",
                            "promoted": false,
                            "value": "fc4c11b71b8d7010bc0b2063b24bcb86"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "va",
                            "promoted": false,
                            "value": "9551f9a71bb03010bc0b2063b24bcb0e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output",
                            "promoted": false,
                            "value": "7137d6761b257010bc0b2063b24bcb1c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output with card",
                            "promoted": false,
                            "value": "aeb9c2831ba17010935ca869b04bcba7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output with link",
                            "promoted": false,
                            "value": "f62a8a831ba17010935ca869b04bcbe6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "videocard",
                            "promoted": false,
                            "value": "1c4a8a8d1b413010bc0b2063b24bcb55"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "View KB -ITSM",
                            "promoted": false,
                            "value": "8b74730d1b0d3010bc0b2063b24bcbda"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "VPN connectivity",
                            "promoted": false,
                            "value": "0787df451b29f010935ca869b04bcb12"
                        }]
                    }],
                    "openByDefault": false,
                    "promptMsg": "What's your issue or request? Or take a look at what I can help with.",
                    "required": true
                },
                "uiType": "TopicPickerControl",
                "value": "0787df451b29f010935ca869b04bcb12"
            },
            "sendTime": 1632920114000,
            "sender": {
                "avatarPath": null,
                "displayName": null,
                "initials": null,
                "name": "Johnnie Rheaves",
                "showNameInHeader": false,
                "sysId": "3d826bf03710200044e0bfc8bcbe5d21",
                "userName": null
            },
            "sequence": "17c319f98900000001",
            "serialNumber": 0,
            "taskId": "c2ef26cf1b32f010bc0b2063b24bcbb8",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920094000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "42ef2a83a072f010b83211ff73818d84",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "type": "topic"
                },
                "nluTextEnabled": false,
                "searchText": "",
                "uiMetadata": {
                    "categories": [{
                        "@class": ".TopicPickerControl$Category",
                        "label": " ",
                        "options": [{
                            "@class": ".TopicPickerControl$Option",
                            "label": "AA control",
                            "promoted": false,
                            "value": "f9bdb5f81b8af010bc0b2063b24bcbfe"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "acme",
                            "promoted": false,
                            "value": "c1e8acbf1b497010bc0b2063b24bcb83"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "all controls 2",
                            "promoted": false,
                            "value": "8357e4351b497410bc0b2063b24bcb61"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "all controls 3",
                            "promoted": false,
                            "value": "031539021b0db410bc0b2063b24bcb05"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Allcontrols",
                            "promoted": false,
                            "value": "2efb1e451bc13010bc0b2063b24bcbb4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "aSkippableControl",
                            "promoted": false,
                            "value": "8c03adeb1bf83010bc0b2063b24bcbac"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "boolean",
                            "promoted": false,
                            "value": "e95616411bc13010bc0b2063b24bcbe6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "card info",
                            "promoted": false,
                            "value": "a1ac933b1bb83010bc0b2063b24bcb85"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cardop",
                            "promoted": false,
                            "value": "28985bab1b417010bc0b2063b24bcb17"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cardop2",
                            "promoted": false,
                            "value": "124228771b497010bc0b2063b24bcb7e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "carousel",
                            "promoted": false,
                            "value": "15b1964d1b813010bc0b2063b24bcbc7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Change Password (Template)",
                            "promoted": false,
                            "value": "07811ecdc7d310100a9b5d83c7c2602d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "cisco",
                            "promoted": false,
                            "value": "4b78a0bf1b497010bc0b2063b24bcb9b"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Company Gift Program",
                            "promoted": false,
                            "value": "0c6ae7761bf6b010bc0b2063b24bcba3"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "CustomcontrolTopic",
                            "promoted": false,
                            "value": "a722bab31b383010bc0b2063b24bcb73"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "default values",
                            "promoted": false,
                            "value": "d4cc23411bc93010bc0b2063b24bcbff"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "deflection test",
                            "promoted": false,
                            "value": "62a157a71b853410d7a765b3b24bcbae"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "EmojiandTable",
                            "promoted": false,
                            "value": "8b02bdc11bcd7410bc0b2063b24bcbe4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "fdih action",
                            "promoted": false,
                            "value": "5ede77eb1bc93410d7a765b3b24bcbb6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "FilePicker",
                            "promoted": false,
                            "value": "d1075adf1b45b410bc0b2063b24bcbd5"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Flight Booking",
                            "promoted": false,
                            "value": "3832c7ce1b09f010d7a765b3b24bcba4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "google",
                            "promoted": false,
                            "value": "5e1f68321bed3010bc0b2063b24bcb03"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "greeting message",
                            "promoted": false,
                            "value": "c40eec131bf57410935ca869b04bcb6c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "haha",
                            "promoted": false,
                            "value": "4a85a0bb1b497010bc0b2063b24bcbc0"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Hardware Issues",
                            "promoted": false,
                            "value": "db28eb341b2db010935ca869b04bcb3f"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Hardware Issues (Template)",
                            "promoted": false,
                            "value": "7670c3ce073220109c3e59bf1ad3007e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "html",
                            "promoted": false,
                            "value": "99e588d51b417010bc0b2063b24bcb9a"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image broken",
                            "promoted": false,
                            "value": "583296721b257010bc0b2063b24bcbdf"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image gif , png, svg",
                            "promoted": false,
                            "value": "dced02be1be17010bc0b2063b24bcb9c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image input op",
                            "promoted": false,
                            "value": "94630f3b1bf03010d7a765b3b24bcb3d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image output",
                            "promoted": false,
                            "value": "4844a68d1bc13010bc0b2063b24bcb43"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "image output high",
                            "promoted": false,
                            "value": "102582b61be17010bc0b2063b24bcb68"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Link and multilink",
                            "promoted": false,
                            "value": "c6273bc11b4d3010bc0b2063b24bcb00"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Live Agent Support.",
                            "promoted": false,
                            "value": "ce2ee85053130010cf8cddeeff7b12bf"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "multi flow",
                            "promoted": false,
                            "value": "871cb7091b8d3010bc0b2063b24bcb94"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Multiflow output control",
                            "promoted": false,
                            "value": "7ab19c551b06f810935ca869b04bcb8d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "multilinkcard",
                            "promoted": false,
                            "value": "e690e2c91bc13010bc0b2063b24bcbfb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Open IT Ticket",
                            "promoted": false,
                            "value": "558218951b06f810935ca869b04bcb62"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Open It Ticket (Testing)",
                            "promoted": false,
                            "value": "afdf06a21b55fc10d7a765b3b24bcb38"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Order Item",
                            "promoted": false,
                            "value": "a1adf68a1b09f010d7a765b3b24bcbcb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Printer Issues",
                            "promoted": false,
                            "value": "aca27b451ba9f010935ca869b04bcb6e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "public",
                            "promoted": false,
                            "value": "7db0e3931b81f010d7a765b3b24bcb95"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "rahul - picker",
                            "promoted": false,
                            "value": "296e76de1b093410d7a765b3b24bcb54"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "record card",
                            "promoted": false,
                            "value": "8b34eafe1b257010bc0b2063b24bcb9f"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "reference choice",
                            "promoted": false,
                            "value": "a996cbfb1bf03010d7a765b3b24bcb09"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "reference choice test",
                            "promoted": false,
                            "value": "6ee9e2c21bc5f010d7a765b3b24bcba4"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "RSA Token (Template)",
                            "promoted": false,
                            "value": "6b2641b0c30120105ae0d2bf6d40ddfb"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "script output",
                            "promoted": false,
                            "value": "77fdf3c11bcd3010bc0b2063b24bcbb2"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "Service Disruption",
                            "promoted": false,
                            "value": "beb967c91b69f010935ca869b04bcb86"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "small image",
                            "promoted": false,
                            "value": "7c5676b31b75f410935ca869b04bcbb3"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "SMScontrols2",
                            "promoted": false,
                            "value": "0b7693e71b417010bc0b2063b24bcb68"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "static choice 3",
                            "promoted": false,
                            "value": "592564b61bad3010bc0b2063b24bcb5c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "table 2",
                            "promoted": false,
                            "value": "33c1f43f1b897010bc0b2063b24bcbe7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "table op",
                            "promoted": false,
                            "value": "660c5bf71bb83010bc0b2063b24bcb34"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "test carousel",
                            "promoted": false,
                            "value": "e1faedb11b4d7410bc0b2063b24bcba2"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "TestMyControls",
                            "promoted": false,
                            "value": "b47c03d51b8db010bc0b2063b24bcb44"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text control",
                            "promoted": false,
                            "value": "b2bb43161b893410d7a765b3b24bcb44"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text ip op",
                            "promoted": false,
                            "value": "205a42311b49b010d7a765b3b24bcb0d"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "text op",
                            "promoted": false,
                            "value": "d8ef3d751b8d7410bc0b2063b24bcb61"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "top",
                            "promoted": false,
                            "value": "22a9a0331b897010bc0b2063b24bcbec"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "UpdateIncidentTest",
                            "promoted": false,
                            "value": "fc4c11b71b8d7010bc0b2063b24bcb86"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "va",
                            "promoted": false,
                            "value": "9551f9a71bb03010bc0b2063b24bcb0e"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output",
                            "promoted": false,
                            "value": "7137d6761b257010bc0b2063b24bcb1c"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output with card",
                            "promoted": false,
                            "value": "aeb9c2831ba17010935ca869b04bcba7"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "video output with link",
                            "promoted": false,
                            "value": "f62a8a831ba17010935ca869b04bcbe6"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "videocard",
                            "promoted": false,
                            "value": "1c4a8a8d1b413010bc0b2063b24bcb55"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "View KB -ITSM",
                            "promoted": false,
                            "value": "8b74730d1b0d3010bc0b2063b24bcbda"
                        }, {
                            "@class": ".TopicPickerControl$Option",
                            "label": "VPN connectivity",
                            "promoted": false,
                            "value": "0787df451b29f010935ca869b04bcb12"
                        }]
                    }],
                    "openByDefault": false,
                    "promptMsg": "What's your issue or request? Or take a look at what I can help with.",
                    "required": true
                },
                "uiType": "TopicPickerControl",
                "value": "Show me everything"
            },
            "sendTime": 1632920094000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319f486e0000001",
            "serialNumber": 4,
            "taskId": "c2ef26cf1b32f010bc0b2063b24bcbb8",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920094000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "4eef26cf3832f010ff755d8f149b82b8",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "uiType": "OutputText",
                "value": "What's your issue or request? Or take a look at what I can help with."
            },
            "sendTime": 1632920094000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319f47ab0000001",
            "serialNumber": 3,
            "taskId": "c2ef26cf1b32f010bc0b2063b24bcbb8",
            "validationErrorMessage": ""
        }, {
            "@class": ".MessageDto",
            "consumerAccountId": "94ef2a831b72f010bc0b2063b24bcb0e",
            "conversationId": "18ef2a831b72f010bc0b2063b24bcb0f",
            "createdAt": 1632920094000,
            "direction": "outbound",
            "hidden": false,
            "isAgent": false,
            "links": [],
            "loggingProcessorTimeMap": {},
            "messageId": "4aef26cf1b32f010bc0b2063b24bcbb8",
            "queueMsgDataType": "systemTextMessage",
            "receiveTime": 0,
            "richControl": {
                "model": {
                    "name": "fieldAck.__silent_OutputPrompt_19894aa6e7444c49ba9c5ad03cbaf9ee",
                    "type": "outputMsg"
                },
                "uiMetadata": {
                    "maskType": "NONE",
                    "paginationBreak": 0,
                    "totalOptionsCount": 0,
                    "totalSearchResultsCount": 0
                },
                "uiType": "OutputText",
                "value": "Hi, I'm your Virtual Agent. How can I help you today?"
            },
            "sendTime": 1632920094000,
            "sender": {
                "avatarPath": botAvatar,
                "displayName": "Virtual Agent",
                "initials": "VA",
                "name": "Virtual Agent",
                "showNameInHeader": false,
                "sysId": "920d556f1bb83010bc0b2063b24bcb4a",
                "userName": "virtual.agent"
            },
            "sequence": "17c319f479d0000001",
            "serialNumber": 2,
            "taskId": "c2ef26cf1b32f010bc0b2063b24bcbb8",
            "validationErrorMessage": ""
        }]
    };
    return payload;
}
