function onLoad() {
  if (g_form.isNewRecord()) {
    return;
  }
  g_form.setReadOnly('data_source', true);
  g_form.setReadOnly('taxonomy', true);
}
