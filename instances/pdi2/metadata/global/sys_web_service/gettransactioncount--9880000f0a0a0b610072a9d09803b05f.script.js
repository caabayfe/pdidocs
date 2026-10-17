/**********
 * Use the following business rule to invoke this example service
 *
 * // create the soap document
 * var soapdoc = new SOAPEnvelope("GetTransactionCount", "http://www.service-now.com/");
 * soapdoc.setFunctionName("execute");
 *
 * // post the request
 * var soapRequest = new SOAPRequest("http://localhost:8080/glide/GetTransactionCount.do?SOAP");
 * var soapResponse = soapRequest.post(soapdoc);
 * var transactions = gs.getXMLText(soapResponse, "//executeResponse/transactions");
 *
 * gs.log(transactions);
 *
 ***********/

var servlet = GlideServlet.getServlet();
response.transactions = servlet.getTotalTransactions();
