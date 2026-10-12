var r = new RESTMessage('Yahoo Finance', 'get');
r.setStringParameter('symbol', current.stock_symbol);
var response = r.execute();
var body = response.getBody();

if (response.getStatusCode() == 200) {
	current.stock_price = body;
	current.update();
} else {
	gs.addInfoMessage(gs.getMessage("This action is no longer supported as the Yahoo Finance API to retrieve the stock quote has been discontinued."));
}


gs.setRedirect("core_company.do?sys_id=" + current.sys_id);
