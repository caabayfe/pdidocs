var gr = new GlideRecord("${sysparm_table}");
gr.query("sys_id", "${sysparm_id}");
if ( gr.next()) {
 var diff =  gel("diff");
 diff.innerHTML = gr.payload_diff;
}
