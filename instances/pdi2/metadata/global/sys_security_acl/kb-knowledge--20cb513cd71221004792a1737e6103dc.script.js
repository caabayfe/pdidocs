var kbKnowledge = new KBKnowledge();
if(kbKnowledge.isMultipleKnowledgeUpdate())
	answer = true;
else
	answer = kbKnowledge.canWrite(current);
