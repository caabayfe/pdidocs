(function refineQuery(current, parent) {
    var path = '/' + parent.application_namespace + '/' + parent.namespace;
    current.addEncodedQuery("type=GraphQL^name=" + path + "^ORnameSTARTSWITH" + path);
})(current, parent);
