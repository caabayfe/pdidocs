function transform(input) {
    if (!input || !input.blockId)
        return {};
    var pageParams = input.pageParams || {};
    pageParams["_lazy"] = true;
    var blockGr = new GlideRecord('sn_ace_content_block');
    if (!blockGr.get(input.blockId))
        return {};

    var documentTable = blockGr.getValue('document_table');
    if (documentTable != 'sn_ace_page')
        return {};

    var pageGr = new GlideRecord('sn_ace_page');
    if (!pageGr.get(blockGr.getValue('document_id')))
        return {};

    var pageVersion = pageGr.getValue('version');
    if (pageVersion && pageVersion === 'v2')
        return new ACEAppBuilderUtilV2().getContentBlockPayload(input.blockId, pageParams, input.includeChildBlocks);

    return new ACEAppBuilderUtil().getContentBlockPayload(input.blockId, pageParams, input.includeChildBlocks);
}
