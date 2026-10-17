var gr = new GlideRecord("sys_atf_transaction_mtom");
gr.addQuery("transaction_id", current.sys_id);
gr.query();

answer = gr.hasNext();
