doInsertAndStay();
function doInsertAndStay() {
    if (typeof current.number != 'undefined' && current.number)
        current.number = ""; // generate a new number
    
    current.insert();
    //insert may delete current from the database
    
    //query to find the record that holds the same values as current
    var gr = new GlideRecord("alm_consumable");
    gr.addQuery("model", current.model);
    gr.addQuery("location", current.location);
    gr.addQuery("model_category", current.model_category);
    gr.addQuery("stockroom", current.stockroom);
    gr.addQuery("install_status", current.install_status);
    gr.addQuery("substatus", current.substatus);
    gr.query();
    gr.next()

    action.setRedirectURL(gr);
}
