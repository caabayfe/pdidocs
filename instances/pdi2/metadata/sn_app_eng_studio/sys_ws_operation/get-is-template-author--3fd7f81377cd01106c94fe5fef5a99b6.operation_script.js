(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var isTemplateAuthor = gs.hasRole('app_template_author');

    response.setBody({
        isTemplateAuthor: isTemplateAuthor
    });

})(request, response);
