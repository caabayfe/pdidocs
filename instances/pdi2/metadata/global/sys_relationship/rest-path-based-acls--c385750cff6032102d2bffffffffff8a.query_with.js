(function refineQuery(current, parent) {
    var path = parent.operation_uri;
	var methd = parent.http_method.toLowerCase();
	var restPathAcl = new sn_ws.RestPathAcl(methd, path);
	var normalizedPath = restPathAcl.getNormalizedName();
    current.addEncodedQuery("type=REST_Endpoint^operation.name=http_" + methd + "^name=" + path + "^ORname=" + normalizedPath);
})(current, parent);
