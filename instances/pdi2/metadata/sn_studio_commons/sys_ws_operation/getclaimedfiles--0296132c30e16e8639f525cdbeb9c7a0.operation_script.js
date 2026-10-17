(function process(request, response) {

    var values = request.queryParams["sysparm_sys_id"];
    var appSysId = (values && values.length) ? values[0] : null;

    var count = sn_gfiles.ClaimAPI.getNumberOfStolenFilesForApp(appSysId);

    response.setContentType("text/plain");
    response.setStatus(200);
    response.getStreamWriter().writeString(String(count));

})(request, response);
