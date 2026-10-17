/**
 * Compares and manipulates version strings.
 * 
 * @package com.snc.discovery
 * @since fuji
 * @author roy.laurie
 */
var Version = function(version, options) {
	
	// initialize default values
	this.delimiter = '.';
	this.segments = [];
	this.major = null;
	this.minor = null;
	this.build = null;
	this.version = null;
	
	if (typeof version == 'undefined' || version == null)
		return;
	
	// convert java string to javascript if required
	version = '' + version;
	version.trim();
	
	if (version.length === 0)
		return;
	
	// obtain major.minor.build version numbers (version can not be null)
	var segments = version.split(this.delimiter);	
	
	// extract version segments until an invalid segment is encountered (e.g. 1..3) or end encountered.
	for (var i = 0; i < segments.length; ++i) {
		var segment = parseInt(segments[i]);
		
		// Invalid format? (e.g. implied build number is missing => '4.12.')
		if (isNaN(segment)) {
			// format is invalid - reset input version
			version = null;
			break;
		}
		
		this.segments.push(segment);
	}
	
	// reset input version if format was invalid
	if (this.segments.length === 0)
		version = null;

	this.major = ( typeof this.segments[0] !== 'undefined' ? this.segments[0] : null );
	this.minor = ( typeof this.segments[1] !== 'undefined' ? this.segments[1] : null );
	this.build = ( typeof this.segments[2] !== 'undefined' ? this.segments[2] : null );
	
	// store final input version in object property
	this.version = version;
};

Version.prototype = {
	lessThan: function(version) {
		var rh = this._validateVersion(version);
		if (rh === null)
			return false;

		var maxSegments = ( this.segments.length > rh.segments.length ? this.segments.length : rh.segments.length );
		for (var i = 0; i < maxSegments; ++i) {
			var segment = ( typeof this.segments[i] === 'undefined' ? 0 : this.segments[i] );
			var rhSegment = ( typeof rh.segments[i] === 'undefined' ? 0 : rh.segments[i] );
			
			if (segment < rhSegment)
				return true;
			if (segment > rhSegment)
				return false;
		}
		
		return false;
	},
	
	greaterThan: function(version) {
		var rh = this._validateVersion(version);
		if (rh === null)
			return false;

		var maxSegments = ( this.segments.length > rh.segments.length ? this.segments.length : rh.segments.length );
		for (var i = 0; i < maxSegments; ++i) {
			var segment = ( typeof this.segments[i] === 'undefined' ? 0 : this.segments[i] );
			var rhSegment = ( typeof rh.segments[i] === 'undefined' ? 0 : rh.segments[i] );
			
			if (segment > rhSegment)
				return true;
			if (segment < rhSegment)
				return false;
		}
		
		return false;
	},
	
	equals: function(version) {
		var rh = this._validateVersion(version);
		return rh !== null && this.version === rh.version;
	},
	
	_validateVersion: function(version) {
		if (this.version === null)
			return null;
		
		if (typeof version === 'undefined' || version === null)
			return null;
		
		if (!(version instanceof Version))
			version = new Version(version);
		
		if (version.version === null)
			return null;
		
		return version;
	},
	
	type: 'Version',
};
