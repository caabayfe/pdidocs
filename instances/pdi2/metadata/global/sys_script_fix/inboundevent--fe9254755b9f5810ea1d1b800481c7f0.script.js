var gr = new GlideRecord('sys_ws_operation');

gr.addQuery('operation_uri', '=', '/api/global/em/inbound_event');
gr.addQuery('http_method', '=', 'post');
gr.query();

while (gr.next()) {
    gr.setValue('operation_script', '(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {\
    return new InBoundEvent().process(request, response);\
})(request, response);');
    gr.update();

}
