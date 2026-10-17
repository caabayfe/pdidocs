function onCondition() {
  var styles = new Array(3);
  styles['section-ddc450b2eb012100fcfb858ad106fe1f'] = 'block'; // components section
  styles['section-2b55ec6337332100fcfbe81d6e41f118'] = 'block'; // columns section
  styles['section-91c450b2eb012100fcfb858ad106fe20'] = 'block'; // buttons section
  styles['section-0145ac6337332100fcfbe81d6e41f1d5'] = 'block'; // button labels section
	
  g_form.showRelatedList("sc_layout_ui_macro_mtom");
  g_form.showRelatedList("sc_layout_column_mtom");

  hideEmptyScLayoutSections(styles);
}
