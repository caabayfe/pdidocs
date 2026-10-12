var uri = action.getGlideURI();
var path = uri.getFileFromPath() + '';
path = path.substring(0, path.length - 5) + '.do';

uri.set('sys_id', '-1');

var isKnowledgeBlock = (path == 'kb_knowledge_block.do');
var isTemplate = (path.startsWith('kb_template_') || path.startsWith('u_kb_template_'));

if (isKnowledgeBlock || isTemplate) {
    action.setRedirectURL(uri.toString(path));
} else {
    action.setRedirectURL(uri.toString('knowledge_create.do'));
}

action.setNoPop(true);
