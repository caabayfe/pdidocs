var kbKnowledge = new KBKnowledgeBase();
if(kbKnowledge.isMultipleKnowledgeUpdate())
	answer = true;
else
	answer = kbKnowledge.canWrite(current);
