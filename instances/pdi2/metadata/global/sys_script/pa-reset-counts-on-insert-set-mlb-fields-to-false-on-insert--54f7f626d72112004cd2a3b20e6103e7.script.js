(function executeRule(current, previous /*null when async*/ ) {

    // checking if is_mlb_enabled and is_mlb_supported is a valid field in the table and then making the value to default false
    if (current.isValidField('is_mlb_enabled') && current.isValidField('is_mlb_supported')) {
        current.is_mlb_enabled = false;
        current.is_mlb_supported = false;
    }

})(current, previous);
