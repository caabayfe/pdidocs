answer = false;

if (!gs.nil(current.sttrm_template))
    answer = current.sttrm_template.getRefRecord().canRead();
