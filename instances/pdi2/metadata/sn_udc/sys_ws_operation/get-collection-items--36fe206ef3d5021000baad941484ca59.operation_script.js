(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );

    const {
        collectionSysId,
        type = ''
    } = params;
    const LOG = new Logger(`GET:/v1/collection/${collectionSysId}/items?type=${type}`);

    try {
        if (!Collection.isValidCollection(collectionSysId))
            throw `Invalid collection: ${collectionSysId}`;

        const collectionItems = CollectionItem.getCollectionItemsForUser(collectionSysId, {
            type
        });

        return {
            status: 'success',
            ...collectionItems
        };
    } catch (error) {
        LOG.error(`Failed to retrieve collection items: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
