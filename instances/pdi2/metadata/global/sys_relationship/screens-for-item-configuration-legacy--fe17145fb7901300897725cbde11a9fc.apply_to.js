var gr = new GlideRecord('sys_sg_screen');
//Only allow them to add this relationship if the sys_sg_screen still has the 'parent' field otherwise we dont do show it
var showRelationship = (gr.getElement('parent') !== null) ? 'sys_sg_screen' : '';

answer = (showRelationship && table_name == 'sys_sg_master_item');
