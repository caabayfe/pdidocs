(function executeRule(current, previous /*null when async*/ ) {

    current.internal_name = new AMBUtils().generateInternalName(current);

})(current, previous);
