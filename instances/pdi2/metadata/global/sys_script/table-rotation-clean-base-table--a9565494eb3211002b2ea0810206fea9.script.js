var scheduler = new ScheduleOnce();
scheduler.setLabel('Truncate base table: ' + current.name);
var safeName = JSON.stringify(String(current.name));
scheduler.script =
	"var gr = new GlideRecord('sys_table_rotation');\n" +
	"var isRuleTypeRotate = false;\n" +
	"gr.addQuery('name', " + safeName + ");\n" +
	"gr.query();\n" +
	"while(gr.next()) {\n" +
	"  var sys_rotation_type = gr.getValue('type');\n" +
	"if(sys_rotation_type == 'rotate') { \n" +
	"  gr.setValue('base_cleaned', true);\n" +
	"  gr.update();\n" +
	"  isRuleTypeRotate = true;\n" +
	"}}\n" +
	"if(isRuleTypeRotate) {\n" +
		"new SncTableRotation(" + safeName + ").truncateTable(" + safeName + "); }";
if (!gs.nil(current.clean_base_rotation))
	scheduler.setTime(new GlideDateTime(current.clean_base_rotation));
scheduler.schedule();
