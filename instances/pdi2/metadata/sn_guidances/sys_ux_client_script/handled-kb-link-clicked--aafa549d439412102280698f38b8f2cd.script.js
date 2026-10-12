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
    const {
        name,
        payload
    } = event;
    const SN_KNOWLEDGE_CONTENT_NUMBER_LINK_CLICKED = 'SN_KNOWLEDGE_CONTENT#NUMBER_LINK_CLICKED';
    const SN_KNOWLEDGE_CONTENT_RECORD_OPENED = 'SN_KNOWLEDGE_CONTENT#RECORD_OPENED';
    
    if (name === SN_KNOWLEDGE_CONTENT_NUMBER_LINK_CLICKED) {
        helpers.navigate.to('kb_view', {
            'table': 'kb_knowledge',
            'sysId': api.state.knowledgeArticleId
        }, {}, false, false, 'current');
    } else if (name === SN_KNOWLEDGE_CONTENT_RECORD_OPENED) {
        const {
            table,
            sys_id
        } = payload;
        helpers.navigate.to(table === 'kb_knowledge' ? 'kb_view' : 'record', {
            'table': table,
            'sysId': sys_id
        }, {}, false, false, 'current');
    }
}
