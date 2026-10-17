(function(context, pageParams, blockcontext) {
    var utteranceEntityCount = [];
    var modelSysId = blockcontext.preBuiltModelId;
    var intentGr = new GlideRecord('sys_nlu_intent');
    intentGr.addQuery('model', modelSysId);
    intentGr.query();

    while (intentGr.next()) {
        var intentSysId = intentGr.sys_id;
        var utteranceGr = new GlideAggregate('sys_nlu_utterance');
        utteranceGr.addQuery('intent', intentSysId);
        utteranceGr.addAggregate('COUNT');
        utteranceGr.query();
        utteranceGr.next();

        var intentEntityGr = new GlideAggregate('m2m_sys_nlu_intent_entity');
        intentEntityGr.addQuery('intent', intentSysId);
        intentEntityGr.addAggregate('COUNT');
        intentEntityGr.query();
        intentEntityGr.next();

        var intentDetail = {};
        intentDetail["key"] = intentGr.getValue('sys_id');
        intentDetail["isSelected"] = false;
        intentDetail["cells"] = {
            "Intent": {
                "value": intentGr.getValue('name')
            },
            "Utterances": {
                "value": utteranceGr.getAggregate('COUNT')
            },
            "Entities": {
                "value": intentEntityGr.getAggregate('COUNT')
            }
        };
        utteranceEntityCount.push(intentDetail);
    }

    var obj = {
        "rows": utteranceEntityCount
    };
    return {
        filteredUttrEntityCount: obj,
        uttrEntityCount: obj
    };

})(context, pageParams, blockcontext);
