var transaction = GlideTransaction.get();
var answer = true;
if (transaction != null) {
   var param = transaction.getRequestParameter("sysparm_changeset");
   answer = param == null || param == "";
}
answer;
