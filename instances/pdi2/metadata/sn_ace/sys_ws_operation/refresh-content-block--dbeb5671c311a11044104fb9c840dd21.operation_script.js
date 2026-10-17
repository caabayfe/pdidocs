(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var DATA_BLOCK_TYPE_SYS_ID = 'a886aedfc3dde11044104fb9c840ddb7';
    var aceAppBuilderUtil = new ACEAppBuilderUtilV2();

    var params = request.body.data;
    var shouldRefreshChildBlocks = params.shouldRefreshChildBlocks;
    var cbScriptVariables = params.cbScriptVariables;
    var blockData = params.blockData;

    var refreshedBlock = {};

    var blockGr = new GlideRecord('sn_ace_content_block');
    if (blockData && blockGr.get(blockData.block_id)) {
        if (blockData.type && blockData.type.id == DATA_BLOCK_TYPE_SYS_ID) {
            var dataBlockOutput = aceAppBuilderUtil._evaluateDataBlock(blockGr, blockData, cbScriptVariables);
            refreshedBlock = blockData;
            refreshedBlock.props_details.data_block_output = dataBlockOutput;
        } else {
            refreshedBlock = aceAppBuilderUtil.refreshContentBlock(blockData, cbScriptVariables, shouldRefreshChildBlocks, blockGr);
        }
    }

    response.setBody({
        refreshedBlock: refreshedBlock
    });

})(request, response);
