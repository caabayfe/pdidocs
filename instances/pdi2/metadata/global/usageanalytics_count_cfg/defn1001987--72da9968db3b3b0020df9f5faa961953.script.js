var gr = new GlideAggregate('sc_req_item');
if(gr.isValid()) {
    gr.addAggregate('COUNT','request');
    gr.addEncodedQuery("sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()");
    gr.addHaving('COUNT','>=',2);
    gr.query();
    answer = gr.getRowCount();
}
