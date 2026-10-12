var documentSysId = current.document;
var gr = new GlideRecord('ds_document');
gr.get(documentSysId);
answer = gr.canDelete();
