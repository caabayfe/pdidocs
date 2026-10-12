(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var getContentBlockPageId = function(block_id) {
        var gr = new GlideRecord('sn_ace_content_block');
        gr.get('sys_id', block_id);
        if (gr.document_id) {
            var fetchPageInfo = new GlideRecord('sn_ace_page');
            if (fetchPageInfo.get('sys_id', gr.document_id)) {
                return gr.document_id;
            }
            return "";
        }
    };
    try {
        var requiredTranslations = [];
        var params = request.body.data;
        // fetch translation for page
        if (params.block_id || params.page_id) {
            var pageId = params.page_id || getContentBlockPageId(params.block_id);
            if (pageId) {
                var gr = new GlideRecord('sn_ace_page');
                gr.get(pageId);
                var pageScopeName = gr.sys_scope.scope.toString();
                var translations = JSON.parse(gr.getValue('required_translations'));
                if (translations && translations.length) {
                    translations.forEach(function(translation) {
                        if (requiredTranslations.indexOf(translation.message) === -1) {
                            var translationValue;
                            var translationKey = translation.message;
                            if (translation.code) {
                                translationValue = sn_i18n.Message.getMessage(pageScopeName, translationKey);
                            } else {
                                translationValue = sn_i18n.Message.getMessage("", translationKey);
                            }
                            var translationObject = {
                                'translationKey': translationKey,
                                'translationValue': translationValue
                            };
                            requiredTranslations.push(
                                translationObject
                            );
                        }
                    });
                }
            }

        }
        return requiredTranslations;

    } catch (e) {
        gs.error("Exception Occured while fetching the page translation " + e);
    }

})(request, response);
