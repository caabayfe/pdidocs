(function() {
    if (pm.isZboot()) {
        return;
    }


    var utteranceGr = new GlideRecord("sys_nlu_utterance");
    utteranceGr.addNullQuery('source');
    utteranceGr.setValue('source', 'manual');
    utteranceGr.updateMultiple();
    gs.info('NLU Utterance: updated utterance source field to manual');

})();
