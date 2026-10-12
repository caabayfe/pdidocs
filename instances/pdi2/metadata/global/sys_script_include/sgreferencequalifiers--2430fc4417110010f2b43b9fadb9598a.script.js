var SgReferenceQualifiers = Class.create();
SgReferenceQualifiers.prototype = {
	getGroupedInputReferenceQualifier: function() {
		return 'input_type=qr_barcode^parameter_type=';
	},

	filterEmbeddedScreensForFormSegment: function() {
		return 'sys_class_name=sys_sg_details_screen^ORsys_class_name=sys_sg_activity_stream_screen^ORsys_class_name=sys_sg_sections_screen^ORsys_class_name=sys_sg_related_lists_screen^ORsys_class_name=sys_sg_list_screen^ORsys_class_name=sys_sg_browser_screen';
	},

	type: 'SgReferenceQualifiers'
};
