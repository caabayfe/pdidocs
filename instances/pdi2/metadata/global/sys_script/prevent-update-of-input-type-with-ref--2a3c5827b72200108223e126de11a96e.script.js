(function executeRule(current, previous /*null when async*/) {
	if (previous.input_type.toString() === "qr_barcode" && previous.parameter_type.toString() === "" && (current.input_type.toString() !== "qr_barcode" || current.parameter_type.toString() !== "")) {
			var gr = new GlideRecord("sys_sg_grouped_input");
			gr.addQuery("ui_parameters", current.sys_id);
			gr.query();

			if (gr.next()) {
				gs.addErrorMessage("Invalid UI parameter for grouped input. Only input type of QR/Barcode with no parameter type allowed.");
				current.setAbortAction(true);
			}
	}
})(current, previous);
