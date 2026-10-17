function transform(input) {
    if (!input || !input.content_block_id) return [];
    var util = new sn_ace.ACEAppContextUtil();
    var context = util.getContentBlockContext(input.content_block_id) || {};
    context.progress_id = input.progress_id || '';
    var status = util.setContentBlockContext(input.content_block_id, context);
    return {
        status: status,
        message: 'Progress ID updated on Content Block'
    };
}
