(function executeRule(current, previous /*null when async*/) {

    var mappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
    mappingGr.addQuery('question', current.question);
    mappingGr.query();
    if(!mappingGr.hasNext()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot save record: Selected question should have a mapping in Knowledge Based Question Answer Mapping table.'));
   }

})(current, previous);
