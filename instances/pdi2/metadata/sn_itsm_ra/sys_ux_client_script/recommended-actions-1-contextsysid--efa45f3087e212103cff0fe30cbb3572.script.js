/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // These are the record pages for which we have OOB context
    switch (api.context.props.contextTable) {
        case 'change_request':
            return 'c86cb259839aca506f7fa570ceaad391';
        case 'change_task':
            return 'b2250e60936e82907b5bfff56aba1065';
        case 'incident':
            return '71e20d52532211101d87ddeeff7b1206';
        case 'incident_task':
            return 'f2d04e5aeb960e109c3cfd18cad0cdd8';
        case 'interaction':
            return 'a80c3c3f1bc24e1022bc0d81604bcb6d';
        case 'problem':
            return '41e716151bd2ce106fe28446624bcbcb';
        case 'problem_task':
            return '8d190ad11b92ce106fe28446624bcb98';
        case 'sc_request':
            return 'c6bc6b041bea4e5022bc0d81604bcbc0';
        case 'sc_req_item':
            return '83b0c09c39351210f87718686404edb9';
        case 'sc_task':
            return '33eb841039b51210f87718686404ed17';
    }
    return '';
}
