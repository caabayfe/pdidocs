(function executeRule(current, previous /*null when async*/) {

		/*
		This script will prevent users from updating the parent macroponent field of a ux screen to another top level
		screen belonging in the same screen collection of the current screen
		*/

		const screenCollection = current.getValue("screen_type");
		const parentMacroponent = current.getValue("parent_macroponent");

		const grScreen = new GlideRecord('sys_ux_screen');
		grScreen.addQuery("macroponent", parentMacroponent);
		grScreen.addQuery("screen_type", screenCollection);
		grScreen.query();

		if (grScreen.next()) {
			gs.addErrorMessage(gs.getMessage("Circular dependency detected, cannot specify a parent macroponent/screen belonging to the same screen collection as the current screen"));
			current.setAbortAction(true);
		}
})(current, previous);
