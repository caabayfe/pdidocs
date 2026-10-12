// copied most of this over from the "New" global UI Action 
var templateQuery = 'placeholder=51a768297710330022f7f4d26810617d^component=9c38d25e67a0330075e8ebc172415a21^page=b70867ad0f603300bb57f4a1ff767e15^EQ';
var uri = action.getGlideURI();
var tableName = 'sys_ux_custom_content_root_elem';
uri.set('sys_id', '-1');
uri.set('sysparm_query', templateQuery);
action.setRedirectURL(uri.toString(tableName + '.do'));
action.setNoPop(true);
