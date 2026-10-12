/**
 * Parses raw probe output that has been sectioned off by one or more section headers.
 * Section output will be parsed as an array of lines (raw), JSON, or IndentedMarkup.
 *
 * @since fuji
 * @author roy.laurie
 *
 ** Constructor
 * @param {} options Configuration options. Valid keys as follows:
 *   sectionHeaderRegex: RegExp The pattern used to separate sections. Default format example: [[==PROBE:section_name==]]
 *   jsonSections: string[] An array of section names to parse as JSON.
 *   indentedMarkup: string[] An array of sections names to parse as Indented Markup (lazy json)
 */
var DiscoveryProbeOutputSectionParser = function(options) {
	this._sectionHeaderRegex = DiscoveryProbeOutputSectionParser._DEFAULT_SECTION_HEADER_REGEX;
	this._jsonSections = [];
	this._indentedMarkupSections = [];
	
	if (typeof options === 'undefined')
		return;
	if (typeof options.sectionHeaderRegex !== 'undefined')
		this._sectionHeaderRegex = options.sectionHeaderRegex;
	if (typeof options.jsonSections !== 'undefined')
		this._jsonSections = options.jsonSections;
	if (typeof options.indentedMarkupSections !== 'undefined')
		this._indentedMarkupSections = options.indentedMarkupSections;

	this._strictMarkupSections = options.strictMarkupSections || [];
};

DiscoveryProbeOutputSectionParser._DEFAULT_SECTION_HEADER_REGEX = /\[\[==PROBE:(\w+)==\]\]/;

DiscoveryProbeOutputSectionParser.prototype.type = 'DiscoveryProbeOutputSectionParser';

/**
 * @param string output
 * @return { string sectionName: {}|[],.. }
 */
DiscoveryProbeOutputSectionParser.prototype.parse = function(output) {
	var sections = output.split(this._sectionHeaderRegex);
	var results = {};

	for (var i = 1; i < sections.length; i += 2) {
		var key = sections[i];
		var content = sections[i+1].trim();
		var result = null;
		
		// determine how to parse the section; json, indented markup, raw (line array)
		if (JSUtil.contains(this._jsonSections, key) && content)
			result = JSON.parse(content);
		else if (JSUtil.contains(this._indentedMarkupSections, key))
			result = this._parseIndentedMarkup(content);
		else if (JSUtil.contains(this._strictMarkupSections, key))
			result = this._parseStrictIndentedMarkup(content);
		else
			result = this._parseLines(content);
		
		results[key] = result;
	}
	
	return results;
};

/**
 * @return string[] Each trimmed line of the output.
 */
DiscoveryProbeOutputSectionParser.prototype._parseLines = function(output) {
	var lines = output.split(/\n/);
	var result = [];

	for (var j = 0; j < lines.length; ++j)
		result.push(lines[j].trim());
	
	return result;
};

/**
 * @return {} Parsed as Indented Markup
 */
DiscoveryProbeOutputSectionParser.prototype._parseIndentedMarkup = function(output) {
	var indentedMarkupParser = new DiscoveryIndentedMarkup({ pluralRoot: true });
	var result = indentedMarkupParser.parse(output);
	return result;
};

/**
 * @return {} Parsed as Indented Markup
 */
DiscoveryProbeOutputSectionParser.prototype._parseStrictIndentedMarkup = function(output) {
	var indentedMarkupParser = new DiscoveryStrictIndentedMarkup({ pluralRoot: true });
	var result = indentedMarkupParser.parse(output);
	return result;
};
