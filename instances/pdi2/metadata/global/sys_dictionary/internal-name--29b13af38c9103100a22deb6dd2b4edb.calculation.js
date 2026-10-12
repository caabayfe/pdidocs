answer = (function() {
 var scope = current.sys_scope.scope;
 if (scope.nil())
  scope = "global";

 return scope + "." + current.bucket_table_name + "." + current.bucket_document_id;
})();
