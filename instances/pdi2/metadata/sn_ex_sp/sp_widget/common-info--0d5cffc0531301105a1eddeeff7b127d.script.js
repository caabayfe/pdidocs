(function() {

    data.commonLinkField = options.fields[0];
    data.url = options.url;
    data.taskSysId = options.taskSysId;
    data.external = options.external;
    if (options.fields.length > 1)
        data.commonStaticFields = options.fields.slice(1, 4);

})();
