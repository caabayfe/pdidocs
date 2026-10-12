var kbKnowledge = new KBKnowledgeBase();
if(kbKnowledge.isMultipleKnowledgeUpdate())
	answer = true;
else if(current)
	answer = kbKnowledge.canRead(current);
