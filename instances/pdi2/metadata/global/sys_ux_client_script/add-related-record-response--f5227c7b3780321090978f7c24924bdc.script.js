/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { pushMessage } = imports["global.DMClientMessageHandler"]();
    const {STATE, RULE_TYPE, MESSAGE_TYPE, ACTION, EVENT, STATUS} = imports["global.DMClientConstants"]();
    const { deepClone } = imports["global.DMClientScriptUtils"]();

    var { response, action } = event.payload.data?.output || {};
    var ruleData = deepClone(api.state.ruleData);
    var { related_records } = ruleData[RULE_TYPE.ARCHIVE] || [];
    if(action == ACTION.ADD) {
        var { status } = response;
        if(status == STATUS.SUCCESS) {
            related_records.push(event.payload.data.output.response);
            api.emit(EVENT.CLOSE_POPUP, {});
            api.setState(STATE.MESSAGES, []);
        }
    } else if(action == ACTION.DELETE) {
        response.forEach(res => {
            var {status, sysID} = res;
            if(status == STATUS.SUCCESS) {
                related_records = related_records.filter(record => record.sys_id != sysID);
            }
        });
    }
    ruleData.archive.related_records = related_records;
    api.setState(STATE.RULE_DATA, ruleData);
    if(status == STATUS.ERROR) {
        function decodeError(str) {
            return str.replace(/&#(\d+);/g, (match, dec) => {
                return String.fromCharCode(dec);
            })
        }
        var { messages } = event.payload.data?.output?.response || {};        
        messages.forEach(message => {
            var decodedMessage = decodeError(message);
            pushMessage(api, helpers, {message: decodedMessage, type: MESSAGE_TYPE.CRITICAL})
        })
    }
}
