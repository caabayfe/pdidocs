answer = true;
var gr = new GlideRecord('ml_word_vector_corpus_versions');
gr.addQuery('word_vector_corpus', current.sys_id);
gr.query();
if (gr.next()){
        var artifact_gr = new GlideRecord('ml_model_artifact');
        artifact_gr.addQuery('word_corpus', gr.getUniqueValue());
        artifact_gr.query();
        if (artifact_gr.next()) {
                gs.flushMessages();
                gs.addInfoMessage("This word corpus cannot be edited as it is used in an existing trained solution.");
                answer = false;
        }
}
