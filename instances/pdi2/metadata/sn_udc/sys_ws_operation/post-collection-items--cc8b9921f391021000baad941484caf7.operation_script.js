(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams), {
            payload: request.body.data
        }
    );

    const {
        collectionSysId,
        payload
    } = params;
    const {
        sysId,
        table,
        url,
        label
    } = payload;
    const resolvedCollectionSysId = Collection.isFavoriteCollection(collectionSysId)
        ? Collection.DEFAULT_BOOKMARKS_COLLECTION_ID
        : collectionSysId;
    const LOG = new Logger(`POST:/v1/collection/${resolvedCollectionSysId}`);

    try {
        if (!Collection.isValidCollection(resolvedCollectionSysId))
            throw `Invalid collection: ${resolvedCollectionSysId}`;

        const insertedRecordSysId = CollectionItem.insertCollectionItemForCollection(resolvedCollectionSysId, {
            file: sysId,
            fileTable: table,
            url,
            label
        });

        const collectionItemDetails = CollectionItem.getCollectionItemDetails(insertedRecordSysId);

        return {
            status: 'success',
            ...collectionItemDetails
        };
    } catch (error) {
        LOG.error(`Failed to insert collection item: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
