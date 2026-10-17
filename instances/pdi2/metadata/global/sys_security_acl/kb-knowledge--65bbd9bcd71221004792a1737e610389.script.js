var kbKnowledge = new KBKnowledge();
if(kbKnowledge.isMultipleKnowledgeUpdate())
	answer = true;
else if (current.isNewRecord()) 
	answer = true;
else if (!kbKnowledge.isPartialRecord(current))
	answer = kbKnowledge.canRead(current);
else if(!gs.nil(current.sys_id)){
    var gr1 = new GlideRecord("kb_knowledge");
    gr1.addQuery("sys_id", current.sys_id);
    gr1.query();
    gr1.next();
    answer = kbKnowledge.canRead(gr1);
}else
	answer = false;
