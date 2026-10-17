function onLoad() {
   //set input_table field as glide_var entry name for the condition record
   g_form.setValue("input_table", "var__m_sys_decision_input_" + g_form.getValue("decision_table"));
}
