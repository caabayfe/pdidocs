// Allow setting the reference during record creation. After creation, prevent modifying the reference field.
answer = current.isNewRecord() || gs.nil(current.asset);
