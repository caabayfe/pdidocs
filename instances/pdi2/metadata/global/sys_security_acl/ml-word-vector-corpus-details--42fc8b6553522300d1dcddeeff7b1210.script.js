answer = true;
var gr = new GlideRecord('ml_word_vector_corpus_versions');
gr.addQuery('word_vector_corpus', current.word_vector_corpus);
gr.query();
while(gr.next() && gr.getValue('model_artifact') != null){
	gs.flushMessages();
	gs.addInfoMessage("This word corpus cannot be edited as it is used in an existing trained solution.");
	answer = false;
	break;
}
