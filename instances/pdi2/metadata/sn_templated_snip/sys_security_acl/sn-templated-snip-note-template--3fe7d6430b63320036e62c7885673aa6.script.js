// 	Check delete access for HR response template

var table = current.table.toString();
var isHRTable = table.startsWith('sn_hr');

answer = isHRTable? new sn_templated_snip.NoteTemplateCheck().canAccessHRResponseTemplate(table, 'delete') : true;
