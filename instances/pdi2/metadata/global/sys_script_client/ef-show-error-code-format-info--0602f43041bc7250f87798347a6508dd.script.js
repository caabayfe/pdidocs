function onLoad() {
    var gwt = new GwtMessage();
    var message = gwt.getMessage('Error code must follow the format: PREFIX-XXXX where PREFIX is the error_prefix from the selected source application and XXXX is a 4-digit number.');
    g_form.addInfoMessage(message);
}
