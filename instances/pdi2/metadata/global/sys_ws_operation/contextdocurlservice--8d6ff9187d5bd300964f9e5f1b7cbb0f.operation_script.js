(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    //
    // Usage:  api/now/v1/context_doc_url/CSHelp:Variable-Attributes
    //

    // Redirect response
    //   303 See Other
    //   Location: https://docs.servicenow.com/?context=CSHelp:Variable-Attributes&version=kingston
    // NOTE:
    //   1) An explicit version in the Resource path is mandatory (best practice).
    //   2) The Location response-header field is used to redirect the recipient to a location other than the Request-URI
    //   for completion of the request or identification of a new resource.
    //   For 3xx responses, the location SHOULD indicate the server's preferred URI for automatic redirection to the resource.
    //   The field value consists of a single absolute URI.
    //   https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30

    //
    // Obtain the resource parameters
    //
    var pathParams = request.pathParams;

    // Sanitize the resource id
    var tempResourceid = decodeURIComponent(pathParams.resourceid);
    var tempResourceidSimplePath = "" + tempResourceid.split("/")[0];
    // Sanitize simple path by removing any request parameters
    var sanitizedResourceId = "" + tempResourceidSimplePath.split("?")[0];

    var helpResourceName = "" + sanitizedResourceId.split("&")[0];

    // help resourceid path parameter defined?
    if (helpResourceName) {

        // obtain document site url with release version
        var url = new SNC.ContextDocAPI().getURLFromName(helpResourceName);

        // Redirect url defined?
        if (url) {
            response.setStatus(303);
            var headers = {};
            headers.Location = url;
            response.setHeaders(headers);
            return;
        } else
            return new sn_ws_err.BadRequestError(gs.getMessage("Error obtaining url for resource: %s").replace('%s', helpResourceName));

    }

    // Invalid request - query parameter not defined
    return new sn_ws_err.BadRequestError(gs.getMessage("Relative path resourceid parameter is undefined"));

})(request, response);
