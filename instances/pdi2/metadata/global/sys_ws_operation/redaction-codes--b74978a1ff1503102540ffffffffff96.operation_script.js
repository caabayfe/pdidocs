(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var REDACTION_CODE_ASSIGNMENT_TABLE = 'ds_redaction_code_assignment';
        var redactionCodeData = request.body.data;

        if (!redactionCodeData)
            return new sn_ws_err.BadRequestError('Redaction Code request is not provided');

        var attachmentSysId = redactionCodeData.attachment_sys_id;
        var mappings = redactionCodeData.mappings;

        if (!attachmentSysId)
            return new sn_ws_err.BadRequestError('attachment_sys_id is required');

        if (!mappings || !Array.isArray(mappings) || mappings.length === 0)
            return new sn_ws_err.BadRequestError('mappings array is required');

        var attachmentGr = new GlideRecordSecure('sys_attachment');
        if (!attachmentGr.get(attachmentSysId))
            return new sn_ws_err.NotFoundError('Attachment not found: ' + attachmentSysId);

        var currentUser = gs.getUserID();
        var upsertedCount = 0;
        var failed = [];
        var resetMappings = (redactionCodeData.reset_mappings === true);
        var codes = '[]';

        if (resetMappings) {
            var deleteGr = new GlideRecordSecure(REDACTION_CODE_ASSIGNMENT_TABLE);
            deleteGr.addQuery('user', currentUser);
            deleteGr.addQuery('attachment_sys_id', attachmentSysId);
            deleteGr.deleteMultiple();

            for (var i = 0; i < mappings.length; i++) {
                var mapping = mappings[i];

                if (!mapping || !mapping.keyword) {
                    failed.push({
                        index: i,
                        error: 'keyword is required'
                    });
                    continue;
                }

                codes = '[]';
                if (Array.isArray(mapping.codes))
                    codes = JSON.stringify(mapping.codes);

                var insertGr = new GlideRecordSecure(REDACTION_CODE_ASSIGNMENT_TABLE);
                insertGr.setValue('attachment_sys_id', attachmentSysId);
                insertGr.setValue('keyword', mapping.keyword);
                insertGr.setValue('codes', codes);
                if (insertGr.insert())
                    upsertedCount++;
                else
                    failed.push({
                        keyword: mapping.keyword,
                        error: 'insert failed'
                    });
            }
        } else {
            var assignmentGr = new GlideRecordSecure(REDACTION_CODE_ASSIGNMENT_TABLE);
            assignmentGr.addQuery('user', currentUser);
            assignmentGr.addQuery('attachment_sys_id', attachmentSysId);
            assignmentGr.addQuery('keyword', mappings[0].keyword);
            assignmentGr.query();

            if (assignmentGr.next()) {
                codes = '[]';
                if (Array.isArray(mappings[0].codes))
                    codes = JSON.stringify(mappings[0].codes);

                assignmentGr.setValue('codes', codes);
                if (assignmentGr.update())
                    upsertedCount++;
                else
                    failed.push({
                        keyword: mappings[0].keyword,
                        error: 'update failed'
                    });
            } else {
                failed.push({
                    keyword: mappings[0].keyword,
                    error: 'keyword not found'
                });
            }
        }

        if (upsertedCount === 0 && failed.length > 0) {
            response.setStatus(500);
            response.setBody({
                error: 'All operations failed',
                failed: failed
            });
        } else {
            response.setStatus(200);
            response.setBody({
                upserted: upsertedCount,
                failed: failed
            });
        }

    } catch (e) {
        gs.error('Redaction code assignment API error: ' + e.message);
        return new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('Internal error processing redaction code assignments');
    }

})(request, response);
