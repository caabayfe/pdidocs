(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams), {
            payload: request.body.data
        }
    );

    const {
        collectionItemSysId,
        payload
    } = params;

    const {
        label
    } = payload;

    const LOG = new Logger(`PATCH:/v1/collection/collection_item/${collectionItemSysId}`);

    try {

        const collectionItemDetails = CollectionItem.updateCollectionItem(collectionItemSysId, {
            label
        });

        return {
            status: 'success',
            ...collectionItemDetails
        };
    } catch (error) {
        LOG.error(`Failed to update collection item: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
