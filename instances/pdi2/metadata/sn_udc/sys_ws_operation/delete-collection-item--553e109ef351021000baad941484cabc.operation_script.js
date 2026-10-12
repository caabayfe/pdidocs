(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );

    const {
        collectionItemSysId
    } = params;
    const LOG = new Logger(`DELETE:/v1/collection/collection_item/${collectionItemSysId}`);

    try {
        CollectionItem.deleteCollectionItem(collectionItemSysId);

        return {
            status: 'success'
        };
    } catch (error) {
        LOG.error(`Failed to delete collection item: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
