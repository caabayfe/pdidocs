answer=false;
    if (!GlideStringUtil.nil(current.record_table)) {
        var gr = new GlideRecord(current.record_table);
        if (gr.isValid() && gr.get(current.record_key)) {
            if (gr.canRead()) {
            answer = true;
            }
        }
    }
