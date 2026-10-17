function onCondition() {
      if (!g_form.isNewRecord())
	      g_form.showFieldMsg('read_only', getMessage("Currency2 dependent fields are read only fields."));
}
