answer = true;
var gr = new GlideRecord('ml_word_vector_corpus_versions');
gr.addQuery('word_vector_corpus', current.sys_id);
gr.query();
while(gr.next() && gr.getValue('model_artifact') != null){
	answer = false;
	break;
}
