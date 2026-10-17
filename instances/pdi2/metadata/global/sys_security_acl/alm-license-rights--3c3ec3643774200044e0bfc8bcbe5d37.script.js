var gr = new GlideRecord("clm_m2m_contract_asset");
gr.addQuery("asset", current.sys_id);
gr.addQuery("contract.license_type", 'enterprise');

gr.addQuery("contract.starts", "<=", new GlideDateTime().getDate());
var ce = gr.addQuery("contract.ends", ">=", new GlideDateTime().getDate());
ce.addOrCondition("contract.ends","");

gr.addQuery("added", "<=", new GlideDateTime().getDate());
var ae = gr.addQuery("removed", ">=", new GlideDateTime().getDate());
ae.addOrCondition("removed", "");

gr.query();
if (gr.next())
   answer = false;
else
   answer = true;
