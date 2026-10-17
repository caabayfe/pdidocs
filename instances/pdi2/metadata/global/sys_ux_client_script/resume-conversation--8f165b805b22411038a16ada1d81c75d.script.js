/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var guestSessionId = api.context.props.guestSessionIdentifier !=null ? api.context.props.guestSessionIdentifier : "";
    var returnValue = api.context.props.value != null ? api.context.props.value : "yes";
    var messageId = "";
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 20; i++ ) {
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
                        "options": [
                          {
                            "label": "I'm all set",
                            "value": "yes",
                            "enabled": false,
                            "renderStyle": "data"
                          },
                          {
                            "label": "Show me more on \"ipad\"",
                            "value": "no",
                            "enabled": false,
                            "renderStyle": "data"
                          },
                          {
                            "label": "Ask something else",
                            "value": "another_search",
                            "enabled": false,
                            "renderStyle": "data"
                          }
                        ],
                        "totalSearchResultsCount": 0,
                        "style": "list",
                        "label": "What would you like to do now?",
                        "totalOptionsCount": 3,
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
                      "options": [
                        {
                            "label": "I'm all set",
                            "value": "yes",
                            "enabled": false,
                            "renderStyle": "data"
                        },
                        {
                          "label": "Show me more on \"ipad\"",
                          "value": "no",
                          "enabled": false,
                          "renderStyle": "data"
                        },
                        {
                          "label": "Ask something else",
                          "value": "another_search",
                          "enabled": false,
                          "renderStyle": "data"
                        }
                      ],
                      "totalSearchResultsCount": 0,
                      "style": "list",
                      "label": "What would you like to do now?",
                      "totalOptionsCount": 3,
                      "required": true,
                      "multiSelect": false
                    },
                    "value": returnValue,
                    "responseContent": returnValue,
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
                "sender":{
                  "sysId": api.context.props.requestedFor
                },
                "direction": "inbound",
                "newVariables":{
                  "requestId": event.payload.number,
                  "requestTable": event.payload.table,
                  "requestSysId": event.payload.sysId
                },
                "sendTime": new Date().getTime()
                },
            "nodeVariable": api.context.props.nodeVariable,
            "source": "uib",
            "amb_client_echo": true
        };
    helpers
    .snHttp("api/now/cs_message", {
      method: "POST",
      body: requestBody,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "amb-channel": "/cs/messages/"+ api.context.props.sessionId,
        "guest_session_identifier": guestSessionId
              }
    })
    .then(({ response }) => {
      helpers.navigate.to("acknowledge",{status:"success", table: event.payload.table, sysId: event.payload.sysId, number: event.payload.number});
    })
    .catch(({ error }) => {
      helpers.navigate.to("acknowledge",{status:"failure", table: event.payload.table, sysId: event.payload.sysId, number: event.payload.number});
    });
}
