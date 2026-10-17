if (current.source_table != null && current.source_table != "") {
    var gr = new GlideRecord(current.source_table);
    gr.get(current.source_id);
   gr.getDisplayValue(gr.getDisplayName());
}
