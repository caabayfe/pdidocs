// Create functions for the REST verbs, prepopulate the endpoint and http_method,
// but don't populate credentials to allow them to be inherited from parent

createHttpMethodRecord('Default GET');

function createHttpMethodRecord(method) {
	var gr = new GlideRecord('sys_rest_message_fn');
	gr.function_name = method;
	gr.http_method = 'get';
	gr.sys_scope = current.sys_scope;
	gr.rest_message = '' + current.sys_id;
	gr.rest_endpoint = current.rest_endpoint;
	gr.insert();
}
