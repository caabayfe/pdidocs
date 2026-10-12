var a = new global.DocumentObjectSecurity();
var u = current.user;
var gr = new GlideRecord('user_criteria');
gr.get(u);
answer = gr.canRead() && a.canReadDocumentId(current.document);
