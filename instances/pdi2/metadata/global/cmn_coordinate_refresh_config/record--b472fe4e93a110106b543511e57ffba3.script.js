(function(current) {
    /* 
     * Form the address correctly using the field values present in the current record, and return it
     * For example:
     * var address = GlideStringUtil.urlEncode(current.getValue("address")); 
     * return address;
     */
    var address = GlideStringUtil.urlEncode(current.street + " " + current.city + " " + current.state + " " +
        current.zip + " " + current.country);
    return address.trim();
})(current);
