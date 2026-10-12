var symbol = gs.getXMLText(current.payload, "//StockQuotes/Stock/Symbol");
var price = gs.getXMLText(current.payload, "//StockQuotes/Stock/Last");

var cgr = new GlideRecord("core_company");
cgr.addQuery("stock_symbol", symbol);
cgr.query();
while (cgr.next()) {
  cgr.stock_price = price;
  cgr.update();
}

current.state = "processed";
current.processed = gs.nowDateTime();
