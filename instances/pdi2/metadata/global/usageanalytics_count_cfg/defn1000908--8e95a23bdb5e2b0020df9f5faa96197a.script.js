var versioningEnabled = new SNC.KnowledgeHelper().isVersioningEnabled();
if(versioningEnabled){
var gr = new GlideAggregate('kb_knowledge');
gr.addAggregate('COUNT');
gr.addEncodedQuery('sys_class_name!=kb_knowledge_block^workflow_state=published^version.version>=2.0^active=true');
gr.query();
var count1;
if(gr.next())
    count1 = gr.getAggregate('COUNT');
else 
	count1 = 0;

gr = new GlideAggregate('kb_knowledge');
gr.addAggregate('COUNT');
gr.addEncodedQuery('sys_class_name!=kb_knowledge_block^workflow_state=published^active=true');
gr.query();
var count2;
if(gr.next())
    count2 = gr.getAggregate('COUNT');
	if(count2 == 0)
		answer = 0;
	else
		answer = count1/count2;
}
else 
	answer = 0;
