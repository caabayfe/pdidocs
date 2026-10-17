// Discovery class

/**
 * Wraps an SNMP payload response instance with methods to safely and easily retrieve SNMP singleton fields or tables.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var SNMPResponse = Class.create();

SNMPResponse.prototype = {
    /*
     * Initializes a new instance of this class from the given payload.
     */
    initialize: function(result) {
        this.snmp = result.snmp;
        if (!this.snmp)
            this.snmp = result.result.snmp;
        this.map = {};

        this.normalize(this.snmp);
        this.buildIndex(this.snmp, '', '');
        this.buildReferences();
    },

    /*
     * Resolve SNMP tables into hashmaps and OID values into primitives. All SNMP numeric types convert to a JavaScript 
     * number. An SNMP null type converts to a JavaScript null. An SNMP IP Address value converts to a Java IPAddressV4 
     * instance. All other values convert to a JavaScript string.
     */
    normalize: function(cur) {
        // what's in this thing?
        for (var prop_name in cur) {
            // if it's an attribute, ignore it...
            if (prop_name.substring(0, 1) == '@' || prop_name.substring(0, 1) == '#')
                continue;

            var prop = cur[prop_name];
            if (JSUtil.nil(prop))
                continue;

            var prop_type = JSUtil.type_of(prop);

            // if this is a leaf value, it will have a type; convert it...
            var oid_type = prop['@type']
            if (oid_type) {
                var oid_numeric = (oid_type == 'SnmpCounter32') || (oid_type == 'SnmpCounter64') ||
                    (oid_type == 'SnmpGauge32');
                oid_numeric = oid_numeric || (oid_type == 'SnmpInt32') || (oid_type == 'SnmpUInt32') ||
                    (oid_type == 'SnmpTimeTicks');
                var oid_null = (oid_type == 'SnmpNull');
                var oid_ip = (oid_type == 'SnmpIPAddress');
                var oid_oid = (oid_type == 'SnmpObjectId');

                if (oid_numeric)
                    cur[prop_name] = JSUtil.has(prop['#text']) ? parseInt(prop['#text']) : 0;
                else if (oid_oid) {
                    var oid_txt = JSUtil.has(prop['#text']) ? '' + prop['#text'] : null;
                    cur[prop_name] = (JSUtil.notNil(oid_txt) && oid_txt.charAt(0) == '.') ? oid_txt.substr(1) : oid_txt;
                } else if (oid_null)
                    cur[prop_name] = null;
                else if (oid_ip)
                    cur[prop_name] = JSUtil.has(prop['#text']) ?
                    SncIPAddressV4.getIPAddressV4Instance(prop['#text']) :
                    null;
                else
                    cur[prop_name] = JSUtil.has(prop['#text']) ? '' + prop['#text'] : null;
                continue;
            }

            // ah, but is this a table?
            var index = prop['@instance'];
            if (index || (prop instanceof Array)) {
                // yup, we've got a table entry; transform it...
                var entries = g_array_util.ensureArray(prop);
                var tm = new SNMPTable();
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    var instance = entry['@instance'].substring(1); // lose the leading period...
                    tm[instance] = entry;
                    this.normalize(entry);
                }
                cur[prop_name] = tm;
                continue;
            }

            // nope, we must have a container, so recursively explore it...
            this.normalize(prop);
        }
    },

    /*
     * Builds references to actual instances for all identified indexes (in the discovery_snmp_ref table) that can be 
     * resolved.
     */
    buildReferences: function() {
        // iterate through all the references we know how to map to table entries...
        var gr = new GlideRecord('discovery_snmp_ref');
        gr.addActiveQuery();
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            var ref = '' + gr.getValue('reference');
            var ent = '' + gr.getValue('entry');
            var ent_obj = this.getOIDObj(ent);
            var ref_last_dot = ref.lastIndexOf('.');
            var ref_base = ref.substring(0, ref_last_dot);
            var ref_leaf = ref.substring(ref_last_dot + 1);
            var refs = this.getAmbiguousOIDs(ref_base, ref_leaf);

            if (JSUtil.nil(ent_obj))
                continue;

            // map to specific entries...
            for (var i = 0; i < refs.length; i++) {
                var entry = refs[i];
                var refers_to = ent_obj[entry[ref_leaf]];
                if (JSUtil.nil(refers_to))
                    refers_to = null;
                entry[ref_leaf + '_'] = refers_to;
            }
        }
    },

    /*
     * Return an array of OIDs that match the given ref_base and which have a defined, non-null ref_leaf.  Note that 
     * the last character of ref_base may be a question mark; in that case, if the parent node is a table then all 
     * table entries are returned.
     */
    getAmbiguousOIDs: function(ref_base, ref_leaf) {
        var result = [];

        // is this an ambiguous entry?
        if (ref_base.substr(-1) == '?') {
            var table = this.getOIDObj(ref_base.substr(0, ref_base.length - 2));
            for (var ent_name in table) {
                var ent = table[ent_name];
                if (!ent)
                    continue;

                var leaf = ent[ref_leaf];
                if (JSUtil.nil(leaf))
                    continue;

                result.push(ent);
            }
        }

        // nope, so treat it as a non-table entry...
        var ent = this.getOIDObj(ref_base);
        if (ent)
            result.push(ent);
        return result;
    },

    /*
     * Builds an index to all SNMP entities in our object. Note that it does NOT index the fields within table entries 
     * (though it does index the table itself).
     */
    buildIndex: function(cur, name, ext_name) {
        // what's in this thing?
        for (var prop_name in cur) {
            // if it's an attribute, ignore it...
            if (prop_name.substring(0, 1) == '@' || prop_name.substring(0, 1) == '#')
                continue;

            var prop = cur[prop_name];
            var prop_type = JSUtil.type_of(prop);

            // add this fellow to our index...
            var index = ext_name + ((ext_name == '') ? '' : '.') + prop_name;
            this.map[index] = prop;

            // if this property is a table, a primitive, or an IPAddressV4, we're done...
            if ((typeof prop != 'object') || (prop instanceof SNMPTable) || (JSUtil.instance_of(prop,
                    'com.snc.commons.networks.IPAddressV4')))
                continue;

            else // nope, we've got something else; recursively explore it...
                this.buildIndex(prop, prop_name, ext_name + ((ext_name == '') ? '' : '.') + prop_name);
        }
    },

    /*
     * Returns the text contained in the OID object with the given MIB name.  Returns null if the object could not be 
     * found, or if it has no text.
     */
    getOIDText: function(name) {
        var oid = this.getOIDObj(name);
        if (JSUtil.nil(oid))
            return null;

        return '' + oid;
    },

    /*
     * Returns the integer contained in the OID object with the given MID name, or zero if the object could not be 
     * found or is empty.
     */
    getOIDInt: function(name) {
        var result = this.getOIDText(name);
        return JSUtil.nil(result) ? 0 : result - 0;
    },

    /*
     * Returns a hashmap of table entries under the given parent MIB name, with the given entry MIB names.  Returns 
     * null if the parent does not exist.
     */
    getOIDTable: function(parent_name, entry_name) {
        var pn = parent_name;
        if (entry_name)
            pn += '.' + entry_name;
        return this.getOIDObj(pn);
    },

    /*
     * Retrieve the OID object with the given MIB name from the response.  Returns null if the object could not be 
     * found, or if any table entries are encountered while walking down the named elements.  Note that this method 
     * does not work with numeric OID strings, only MIB names.
     */
    getOIDObj: function(name) {
        return this.map[name];
    },

    type: "SNMPResponse"
};
