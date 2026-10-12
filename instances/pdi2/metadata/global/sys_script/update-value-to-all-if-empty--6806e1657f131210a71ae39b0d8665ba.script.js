(function executeRule(current, previous /*null when async*/ ) {
    var ALL_VALUE = "ALL";
    current.resource = GlideStringUtil.nil(current.resource) ? ALL_VALUE : current.resource;
    current.method = GlideStringUtil.nil(current.method) ? ALL_VALUE : current.method;

})(current, previous);
