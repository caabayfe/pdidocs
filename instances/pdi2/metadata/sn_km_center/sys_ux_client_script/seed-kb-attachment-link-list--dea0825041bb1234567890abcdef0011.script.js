/**
 * Fires when the Fetch KB Attachment Link List TRANSFORM completes (DATA_FETCH_SUCCEEDED).
 * Seeds attachmentLinkList state from the broker output so ECE's TinyMCE link dropdown
 * is populated on initial page load.
 */
function handler({ api, event }) {
    var brokerData = api.data && api.data.fetch_kb_attachment_link_list_1;
    var linkList = brokerData && brokerData.output && brokerData.output.linkList;
    if (Array.isArray(linkList)) {
        api.setState('attachmentLinkList', linkList);
    }
}
