/*
 * Supports one operation (check ACLs) with a single parameter ("table").  
 * 
 * Returns a single "table" tag with attributes "name", "isValid", "canRead", "canWrite", "canCreate", and "canDelete".
 * If the table isValid is true, and any of canRead, canWrite, or canCreate are true, then there are "field" tags 
 * contained within the table tag, each with attributes 
 */
var resp = process(request);
response.response = new XMLHelper().toXMLDoc(resp);

function process(request) {
    var table = request.table;
    var isStrict = GlideProperties.getBoolean('glide.soap.strict_security');
    var soapSecurity = new GlideSOAPSecurity();
    soapSecurity.setStrictSecurity(isStrict);

    // set up the default response...
    var resp = {result:{table:{}}};
    setAttr(resp.result.table, 'isValid', false);

    // do we have a valid table?
    var gr = new GlideRecord(table);
    if (!gr.isValid())
        return resp;

    // set our table-level responses...
    setAttr( resp.result.table, 'isValid',   true                       );
    setAttr( resp.result.table, 'name',      table                      );
    setAttr( resp.result.table, 'canRead',   soapSecurity.canRead(gr)   );
    setAttr( resp.result.table, 'canWrite',  soapSecurity.canWrite(gr)  );
    setAttr( resp.result.table, 'canCreate', soapSecurity.canCreate(gr) );
    setAttr( resp.result.table, 'canDelete', soapSecurity.canDelete(gr) );
    
    // are we allowed to see this table's fields?
    var canSeeFields = soapSecurity.canRead(gr) || soapSecurity.canWrite(gr) || soapSecurity.canCreate(gr);
    var fields = [];
    var elems = gr.getElements();
    for (var i = 0; i < elems.size(); i++) {
        var elem = elems.get(i);
        var name = '' + elem.getName();
        var field = {};
        setAttr( field, 'name',      name                             );
        setAttr( field, 'canRead',   soapSecurity.canRead(gr, name)   );
        setAttr( field, 'canWrite',  soapSecurity.canWrite(gr, name)  );
        setAttr( field, 'canCreate', soapSecurity.canCreate(gr, name) );
        fields.push(field);
    }
    resp.result.table.field = fields;
    
    return resp;
}

function setAttr(parent, name, value) {
    parent['@' + name] = '' + value;
}
