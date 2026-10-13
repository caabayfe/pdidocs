var DiscoveryMacProfileUtils = Class.create();

DiscoveryMacProfileUtils.prototype = {
    initialize: function() {
    },

    getBaseElement: function(output) {
	    //Since MacOS system_profiler command may prepend error messages to the actual XML output, 
	    // let's sanitize before we try to parse it.
	    var xmlString = output;
	    var startIndex = xmlString.indexOf("<?xml");
	    if (startIndex > 0) 
		   xmlString = xmlString.substring(startIndex);

		// Strip out the Doctype info 'cause we don't need it. In the circumstance where we do not have internet connection,
		// it throws bad errors when we try to parse the xml
		xmlString = xmlString.replace(/<!.+?>/, '');
		
        var profilerXML = XMLUtil.parse(xmlString);		
		if (JSUtil.nil(profilerXML)) {
			var msg = "Unable to parse input payload inside DiscoveryMacProfileUtils";
			gs.log(msg);
					
			return;
		}
		
        var nodes = XMLUtil.getElementByTagName(profilerXML, "array");

        return this.getArrayFromNode(nodes);
    },

    getArrayFromNode: function(el) {
        var a = [];
        var dicts = XMLUtil.getFirstChildElement(el);

        while (dicts) {
            if (dicts.getTagName() == "dict")
                a.push(this.getHashFromNode(dicts));
            else
              a.push(XMLUtil.getAllText(dicts));

            dicts = XMLUtil.getNextElement(dicts);
        }

        return a;
    },

    getHashFromNode: function(el) {
        var hash = {};
        var item = XMLUtil.getFirstChildElement(el);

        while (item) {
            var key = XMLUtil.getAllText(item);
            item = XMLUtil.getNextElement(item);

            if (item) {
                if (item.getTagName() == "array") {
                    hash[key] = "array";
                    hash[key] = this.getArrayFromNode(item);
                } else if (item.getTagName() == "dict") {
                    hash[key] = "hash";
                    hash[key] = this.getHashFromNode(item);
                } else {
                    var str = XMLUtil.getAllText(item);
                    hash[key] = str;
                }

                item = XMLUtil.getNextElement(item);
            }
        }

        return hash;
    },
	
    type: "DiscoveryMacProfileUtils"
}
