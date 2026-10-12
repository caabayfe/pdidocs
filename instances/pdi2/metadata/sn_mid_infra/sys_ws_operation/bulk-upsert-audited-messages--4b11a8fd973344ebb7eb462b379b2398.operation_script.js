/**
 * Scripted REST endpoint that bulk inserts or updates ECC Queue audited messages
 * and their associated metric rows.
 *
 * Delegates to ECCQueueAuditedMessageAPI#bulkUpsertAuditedMessages so all
 * upsert key logic, validation, and ACL enforcement live in the script include.
 *
 * @param {RESTAPIRequest} request
 * @param {RESTAPIResponse} response
 */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var body;
    try {
        body = request.body && request.body.data ? request.body.data : null;
    } catch (e) {
        // Parser exception detail can expose internals; log server-side, return generic message.
        gs.error('[ECCQueueAuditedMessage Bulk Upsert] Invalid JSON body: ' + String(e && e.message ? e.message : e));
        return new WebApiErrorUtility().createBadRequestError('Invalid JSON body');
    }

    if (!body || !Array.isArray(body.messages)) {
        return new WebApiErrorUtility().createBadRequestError("'messages' must be an array of audited message entries");
    }

    try {
        var api = new sn_mid_infra.ECCQueueAuditedMessageAPI();
        return api.bulkUpsertAuditedMessages(body);
    } catch (e) {
        var errMsg = String(e && e.message ? e.message : e);
        gs.error('[ECCQueueAuditedMessage Bulk Upsert] ' + errMsg);
        // Validation errors carry the InvalidValueError shape and authored text — safe to return as detail.
        var name = e && e.name ? String(e.name) : '';
        if (name.indexOf('InvalidValue') !== -1) {
            return new WebApiErrorUtility().createBadRequestError('Invalid request', 400, errMsg);
        }
        // Underlying DB/runtime exceptions can include table or column names; detail is in the log only.
        return new WebApiErrorUtility().createServiceError('Internal server error');
    }
})(request, response);
