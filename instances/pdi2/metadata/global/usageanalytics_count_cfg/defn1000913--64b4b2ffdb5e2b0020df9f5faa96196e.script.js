var kb_ids = [];
var gr = new GlideAggregate("kb_uc_can_contribute_mtom");
gr.addEncodedQuery("kb_knowledge_base.activeISNOTEMPTY");
gr.addAggregate('COUNT');
gr.groupBy("kb_knowledge_base");
gr.query();
while(gr.next()){
kb_ids.push(gr.kb_knowledge_base + '');
}

var gr2 = new GlideAggregate("kb_uc_cannot_contribute_mtom");
gr2.addEncodedQuery("kb_knowledge_base.activeISNOTEMPTY");
gr2.addAggregate('COUNT');
gr2.groupBy("kb_knowledge_base");
gr2.query();
while(gr2.next()){
if(kb_ids.indexOf(gr2.kb_knowledge_base+'')==-1)
    kb_ids.push(gr2.kb_knowledge_base + '');
}
answer = kb_ids.length;
