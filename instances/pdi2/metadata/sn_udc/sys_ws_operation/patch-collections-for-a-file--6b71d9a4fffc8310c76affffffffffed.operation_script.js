(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams), {
            payload: request.body.data
        }
    );

    const {
        payload
    } = params;

    if (!payload) {
        throw 'Request body is required.';
    }

    const {
        sysId,
        table,
        url,
        label,
        add,
        remove
    } = payload;
    const LOG = new Logger('PATCH:/v1/collection/file/collections');

    try {
        if (gs.nil(table) && gs.nil(url)) {
            throw 'Either table or url is required.';
        }

        const result = CollectionItem.updateFileCollections({
            file: sysId,
            fileTable: table,
            url,
            label
        }, add, remove);

        const {
            added,
            removed,
            failures
        } = result;

        if (failures.length > 0) {
            response.setStatus(207);
            LOG.warn(`Partial failure updating file collections: ${failures.length} collection(s) failed`);
            return {
                status: 'partial_error',
                data: {
                    added,
                    removed,
                    failures
                }
            };
        }

        return {
            status: 'success',
            data: {
                added,
                removed
            }
        };
    } catch (error) {
        LOG.error(`Failed to update file collections: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
