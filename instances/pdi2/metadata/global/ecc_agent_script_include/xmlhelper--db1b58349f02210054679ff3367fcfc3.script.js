// Required so can check if g_ var is defined.  Cannot just use 'typeof' on a defined g_ var due to
// the way all the predefined g_ vars are set in the execution context in Java.
function globalDefined(varName) {
	return (function() {
		return (varName in this);
	})();
}

var XMLHelper = Class.create();
XMLHelper.prototype = {

	initialize : function(xml) {
		this.setXML(xml);
		this.trim = (!globalDefined('g_probe') || g_probe == null) ? false :  JSUtil.toBoolean(g_probe.getParameter("glide.xmlhelper.trim.enable", "false"));
	},

	setXML : function(xmlParam) {
		this.xml = xmlParam;

		// if xml is string, or it looks like a string (has trimLeft function and is object)
		// then we want to parse it as a string
		if (typeof xmlParam == 'string' || (typeof xmlParam == 'object' && xmlParam && xmlParam.trimLeft))
			this.xml = Packages.com.glide.util.XMLUtil.parse(xmlParam);
	},

	// convert XML to Javascript Object... Use the format specified on
	// http://www.xml.com/pub/a/2006/05/31/converting-between-xml-and-json.html
	// 'fastRemoveWhite' changes the way empty nodes are removed.  I think the
	// result will be identical, but I'm paranoid about breaking something.
	// New code should always set fastRemoveWhite to true.
	toObject : function(xmlParam, fastRemoveWhite) {

		if (xmlParam)
			this.setXML(xmlParam);

		var xml = this.xml;

		if (!xml)
			return;

		removeWhite(xml);

		return toObj(xml, this.trim);

		// borrowed and modified from: http://goessner.net/download/prj/jsonxml/xml2json.js
		function toObj(xml, doTrim) {
			var i, item, nName, nValue, hasElementChild, n, nodeType, oVal, name, textChildNodeValue,
				attrs, length, firstChild,
				xmlNodeType = xml.getNodeType(),
				o = '', 
				textChild = 0,
				cdataChild = 0;

			if (xmlNodeType == 9)
				return toObj(xml.documentElement, doTrim);

			if (xmlNodeType != 1)
				return o;

			attrs = xml.attributes;
			length = attrs && attrs.length;
			firstChild = xml.firstChild;

			// element node ..

			if (length) // element with attributes ..
				o = o || { };
				for (i = 0; i < length; i++) {
					item = attrs.item(i);
					nName = item.nodeName;
					nValue = '' + item.nodeValue;
					if (doTrim) 
						nValue = nValue.trim();
					o["@" + nName] = nValue;
				}
			attrs = 0;    // Reduce our memory use as much as possible.

			for (n = firstChild; n && textChild < 2 && cdataChild < 2 && !hasElementChild; n = n.nextSibling) {
				nodeType = n.getNodeType();
				if (nodeType == 1)
					hasElementChild = true;
				else if (nodeType == 4)
					cdataChild++; // cdata section node
				else if (nodeType == 3) {
					nValue = n.nodeValue;
					if (nValue.match(/\S/)) {
						textChild++;
						textChildNodeValue = nValue;
					}
				}
			}

			if (hasElementChild) {
				if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
					fastRemoveWhite || removeWhite(xml);
					for (n = firstChild; n; n = n.nextSibling) {
						firstChild = 0;   // Reduce our memory use as much as possible.
						nodeType = n.getNodeType();
						if (nodeType == 3 || nodeType == 4) {
							nValue = escape(n.nodeValue);
							if (nValue) {
								o = o || { };
								if (nodeType == 3)
									o['#text'] = nValue;
								else
									o['#cdata'] = nValue;
							}
						} else {
							o = o || { };
							name = n.nodeName;
							if (oVal = o[name]) { // multiple occurence of element ..
								if (oVal instanceof Array)
									oVal.push(toObj(n, doTrim));
								else
									o[name] = [ oVal, toObj(n, doTrim) ];
							} else
								o[name] = toObj(n, doTrim);  // first occurence of element..
						}
					}
				} else { // mixed content
					if (!length)
						o = escape(innerXml(xml));
					else
						o["#text"] = escape(innerXml(xml));
				}
			} else if (textChild) { // pure text
				if (textChild > 1)
					textChildNodeValue = innerXml(xml);
				
				if (!length)
					o = escape(textChildNodeValue);
				else
					o["#text"] = escape(textChildNodeValue);
			} else if (cdataChild) { // cdata
				if (!length)
					o = escape(firstChild.nodeValue);
				else
					o["#cdata"] = escape(xml.lastChild);
			}

			return o;

			function innerXml(node) {
				var s = "";
				for ( var c = node.firstChild; c; c = c.nextSibling)
					s += asXml(c);
				return s;

				function asXml(n) {
					var attrs, length, item, nName,
						s = "",
						type = n.getNodeType();

					if (type == 1) {
						nName = n.nodeName;
						s += "<" + nName;
						attrs = n.attributes;
						length = attrs.length;
						for (var i = 0; i < length; i++) {
							item = attrs.item(i);
							s += " " + item.nodeName + "=\""
								+ (item.nodeValue || "").toString() + "\"";
						}
						var c = n.firstChild;
						if (c) {
							s += ">";
							for ( ; c; c = c.nextSibling)
								s += asXml(c);
							s += "</" + nName + ">";
						} else
							s += "/>";
					} else if (type == 3)
						s += n.nodeValue;
					else if (type == 4)
						s += "<![CDATA[" + n.nodeValue + "]]>";
					return s;
				}
			}

			function escape(txt) {
				var escapedTxt = '' + (doTrim ? txt.trim() : txt);
				
				return escapedTxt.replaceAll(/([\\\"])/g, '\\$1').replaceAll(/[\\r\\n]/g, '\\n');
			}
		}

		function removeWhite(e) {
			e.normalize();
			for ( var n = e.firstChild; n;) {
				var nodeType = n.getNodeType();
				if (nodeType == 3) { // text node
					if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
						var nxt = n.nextSibling;
						e.removeChild(n);
						n = nxt;
					} else
						n = n.nextSibling;
				} else if (nodeType == 1) { // element node
					removeWhite(n);
					n = n.nextSibling;
				} else
					// any other node
					n = n.nextSibling;
			}
			return e;
		}
	},


	toXMLStr : function(o) {
		var toXml = function(v, name, ind) {
			if (typeof(v) == "function")
				return "";

			var xml = "";
			if (v instanceof Array) {
				for ( var i = 0, n = v.length; i < n; i++)
					xml += ind + toXml(v[i], name, ind + "\t") + "\n";
			} else if (typeof (v) == "object") {
				var hasChild = false;
				xml += ind + "<" + name;
				for ( var m in v) {
					if (m.charAt(0) == "@")
						xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
					else
						hasChild = true;
				}
				xml += hasChild ? ">" : "/>";
				if (hasChild) {
					for (m in v) {
						if (m == "#text")
							xml += v[m];
						else if (m == "#cdata")
							xml += "<![CDATA[" + v[m] + "]]>";
						else if (m.charAt(0) != "@")
							xml += toXml(v[m], m, ind + "\t");
					}
					xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
				}
			} else {
				xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
			}
			return xml;
		};

		var xml = "";
		for ( var m in o)
			xml += toXml(o[m], m, "");
		return xml.replace(/\t|\n/g, "");
	},
	type : "XMLHelper"
};
