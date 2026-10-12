(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var data = request.body.data;
    try {
        var result = {};
        var utteranceId = data.utteranceId;
        var utterance = data.utterance;
        if (utteranceId && utterance) {
            var gr = new GlideRecord('sys_nlu_utterance');
            if (gr.get(utteranceId)) {
                var intent = gr.getValue('intent');
                var intentGR = new GlideRecord('sys_nlu_intent');
                if (intentGR.get(intent)) {
                    var model = intentGR.model;
                    if (model && !global.NLUSystemUtil.canPerformEditOperations(model)) {
                        return {
                            status: "Error: User does not have the ACL permission"
                        };
                    }
                }
                gr.setValue('utterance', utterance);
                gr.setValue('source', 'manual');
                result.status = gr.update() ? 'success' : 'failure';
            } else {
                result.status = 'failure';
            }
        } else {
            result.status = 'failure';
        }
        return result;
    } catch (e) {
        return e;
    }

})(request, response);
