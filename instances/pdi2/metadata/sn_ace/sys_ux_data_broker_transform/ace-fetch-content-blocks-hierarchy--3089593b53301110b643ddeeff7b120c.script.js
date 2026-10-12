function transform(input) {
    if (!input || !input.page_params) return [];
	// var contentBlocks = new ACEAppBuilderUtil().getAllContentBlocksBFS();
    var contentBlocksHierarchy = [];
    // for (var i = 0; i < contentBlocks.length; i++) {
    //     if (contentBlocks[i].block_id == input.page_params.sysId) {
    //         contentBlocksHierarchy.push(contentBlocks[i]);
    //     }
    // }
    return contentBlocksHierarchy;
}
