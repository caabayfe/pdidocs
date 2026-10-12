var transaction = GlideTransaction.get();
answer = false;
if (transaction != null) {
   var view = transaction.getRequestParameter("sysparm_view");
   answer = view == "workflow_start";
}
