/**********
 * Use the following business rule to invoke this example service
 *
 * // create the soap document
 * var soapdoc = new SOAPEnvelope("GetProperty", "http://www.service-now.com/");
 * soapdoc.setFunctionName("execute");
 * soapdoc.addFunctionParameter("property", "glide.db.name");
 *
 * // post the request
 * var soapRequest = new SOAPRequest("http://localhost:8080/glide/GetProperty.do?SOAP");
 * var soapResponse = soapRequest.post(soapdoc);
 * var property = gs.getXMLText(soapResponse, "//executeResponse/property");
 *
 * gs.log(property);
 *
 ***********/

var gr = new GlideRecordSecure('sys_properties');
gr.addQuery('name', request.property);
gr.query();
response.property = gr.next() ? gr.value : null;
