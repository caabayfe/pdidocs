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
    const LOG = new Logger('POST:/v1/collection/file/collections');

    try {
        if (!payload) {
            throw 'Request body is required.';
        }

        const {
            sysId,
            table,
            url,
            label,
            collections
        } = payload;

        if (gs.nil(table) && gs.nil(url)) {
            throw 'Either table or url is required.';
        }

        if (!Array.isArray(collections) || collections.length === 0) {
            throw 'collections must be a non-empty array.';
        }

        const result = CollectionItem.addFileToCollections({
            file: sysId,
            fileTable: table,
            url,
            label
        }, collections);

        const {
            collectionItemSysId,
            file,
            icon,
            added,
            failures
        } = result;

        const responseData = {
            collectionItemSysId,
            added,
            failures: failures || []
        };

        if (file && icon) {
            responseData.file = file;
            responseData.icon = icon;
        }

        if (failures.length > 0) {
            response.setStatus(207);
            LOG.warn(`Partial failure adding file to collections: ${failures.length} collection(s) failed`);
            return {
                status: 'partial_error',
                data: responseData
            };
        }

        LOG.info(`Successfully added file to ${added.length} collection(s)`);
        return {
            status: 'success',
            data: responseData
        };
    } catch (error) {
        LOG.error(`Failed to add file to collections: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
