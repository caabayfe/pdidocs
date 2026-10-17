var existing = new GlideRecord('cmdb_model_category');
if (existing.get('cmdb_ci_class', current.cmdb_ci_class)) { 
   gs.addErrorMessage(gs.getMessage("There is already a category for this CI class"));
   current.setAbortAction(true);
}
