var isValid = GlideDBObjectManager.get().isSoloClass(current.table);
if (!isValid) {
  gs.addErrorMessage("Hierarchical table '" + current.table + "' cannot be preserved. Only tables which have no parent and no extensions can be preserved.");
  current.setAbortAction(true);
}
