(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const data = new UXAHandler().handleQueryRequest(request.body?.data);

    response.setHeader('Content-Type', 'text/csv');
    const streamWriter = response.getStreamWriter();
    streamWriter.writeString(data.csvData.join('\n'));
    response.setStatus(200);

})(request, response);
