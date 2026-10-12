var ga = new GlideAggregate('kb_knowledge_base');
ga.groupBy("workflow");
ga.query();
answer = ga.getRowCount();
