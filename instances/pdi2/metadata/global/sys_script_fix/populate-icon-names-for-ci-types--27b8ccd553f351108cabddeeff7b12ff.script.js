(function() {
  if (pm.isZboot())
        return;

    //check if the column exists
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'ngbsm_ci_type_icon');
	gr.addQuery('element', 'icon_name');
	gr.query();
	if(!gr.next()){
		return;
	}		
//mapping for ngbsm_ci_type_icon record sys_id -> new icon name 
var map = {
 '0b96fe519fa20200ee6219eb552e7048':'tree-workflow-outline',
 '0b96fe519fa20200ee6219eb552e7049':'serverbox-outline',
 '0f96fe519fa20200ee6219eb552e7048':'globe-outline',
 '0f96fe519fa20200ee6219eb552e704a':'serverbox-outline',
 '15d36892c32122003263bea192d3ae0e':'inventory-outline',
 '1987b60b53103200859ca638cec58798':'globe-outline',
 '229c80370b703200639be0d425673a9f':'tree-workflow-outline',
 '26183a0b53103200859ca638cec5872d':'database-outline',
 '30742dd69fb00200eb3919eb552e708b':'globe-outline',
 '30742dd69fb00200eb3919eb552e708c':'database-outline',
 '30742dd69fb00200eb3919eb552e7091':'database-outline',
 '30742dd69fb00200eb3919eb552e7092':'tree-workflow-outline',
 '3296fe519fa20200ee6219eb552e7044':'monitor-outline',
 '34742dd69fb00200eb3919eb552e708e':'folder-outline',
 '34742dd69fb00200eb3919eb552e7092':'save-outline',
 '38742dd69fb00200eb3919eb552e708b':'database-outline',
 '38742dd69fb00200eb3919eb552e708e':'tree-workflow-outline',
 '38742dd69fb00200eb3919eb552e7090':'globe-outline',
 '38742dd69fb00200eb3919eb552e7092':'serverbox-outline',
 '3a96fe519fa20200ee6219eb552e7044':'tree-workflow-outline',
 '3a96fe519fa20200ee6219eb552e7045':'folder-outline',
 '3c342c92c32122003263bea192d3aed0':'image-outline',
 '3c742dd69fb00200eb3919eb552e708b':'database-outline',
 '3e96fe519fa20200ee6219eb552e7043':'serverbox-outline',
 '3e96fe519fa20200ee6219eb552e7045':'serverbox-outline',
 '3e96fe519fa20200ee6219eb552e7046':'serverbox-outline',
 '4b96fe519fa20200ee6219eb552e7048':'tree-workflow-outline',
 '4b96fe519fa20200ee6219eb552e7049':'tree-workflow-outline',
 '4b96fe519fa20200ee6219eb552e704a':'tree-workflow-outline',
 '4b96fe519fa20200ee6219eb552e704b':'folder-outline',
 '4f96fe519fa20200ee6219eb552e7049':'serverbox-outline',
 '63ec0cf70b703200639be0d425673a79':'database-outline',
 '70742dd69fb00200eb3919eb552e708c':'tree-workflow-outline',
 '70742dd69fb00200eb3919eb552e708e':'headset-outline',
 '70742dd69fb00200eb3919eb552e7093':'serverbox-outline',
 '7296fe519fa20200ee6219eb552e7045':'database-outline',
 '74742dd69fb00200eb3919eb552e708b':'database-outline',
 '74742dd69fb00200eb3919eb552e708d':'folder-outline',
 '74742dd69fb00200eb3919eb552e708e':'folder-outline',
 '74742dd69fb00200eb3919eb552e7090':'globe-outline',
 '7696fe519fa20200ee6219eb552e7046':'tree-workflow-outline',
 '78742dd69fb00200eb3919eb552e7090':'globe-outline',
 '78742dd69fb00200eb3919eb552e7092':'phone-user-outline',
 '7c742dd69fb00200eb3919eb552e708b':'database-outline',
 '7e96fe519fa20200ee6219eb552e7043':'tree-workflow-outline',
 '8396fe519fa20200ee6219eb552e7049':'database-outline',
 '8796fe519fa20200ee6219eb552e7048':'folder-outline',
 '8796fe519fa20200ee6219eb552e7049':'database-outline',
 '8b96fe519fa20200ee6219eb552e7048':'tree-workflow-outline',
 '8b96fe519fa20200ee6219eb552e704a':'cd-outline',
 '8b96fe519fa20200ee6219eb552e704b':'serverbox-outline',
 '8f96fe519fa20200ee6219eb552e7047':'serverbox-outline',
 '8f96fe519fa20200ee6219eb552e704a':'cd-outline',
 '8f96fe519fa20200ee6219eb552e704c':'plug-outline',
 '8f96fe519fa20200ee6219eb552e704e':'globe-outline',
 'b0742dd69fb00200eb3919eb552e708b':'database-outline',
 'b0742dd69fb00200eb3919eb552e7091':'comment-outline',
 'b296fe519fa20200ee6219eb552e7045':'database-outline',
 'b4742dd69fb00200eb3919eb552e7091':'database-outline',
 'b4742dd69fb00200eb3919eb552e7092':'plug-outline',
 'b696fe519fa20200ee6219eb552e7044':'tree-workflow-outline',
 'b696fe519fa20200ee6219eb552e7046':'tree-workflow-outline',
 'b8742dd69fb00200eb3919eb552e708b':'database-outline',
 'b8742dd69fb00200eb3919eb552e7091':'dashboard-dial-outline',
 'b8742dd69fb00200eb3919eb552e7092':'cd-outline',
 'ba96fe519fa20200ee6219eb552e7043':'tree-workflow-outline',
 'be96fe519fa20200ee6219eb552e7046':'serverbox-outline',
 'c796fe519fa20200ee6219eb552e7048':'tree-workflow-outline',
 'c796fe519fa20200ee6219eb552e7049':'folder-outline',
 'c796fe519fa20200ee6219eb552e704c':'database-outline',
 'c854ac92c32122003263bea192d3ae17':'image-outline',
 'cb96fe519fa20200ee6219eb552e7048':'tree-workflow-outline',
 'cb96fe519fa20200ee6219eb552e7049':'folder-outline',
 'cf96fe519fa20200ee6219eb552e704b':'cd-outline',
 'cf96fe519fa20200ee6219eb552e704e':'globe-outline',
 'f0742dd69fb00200eb3919eb552e7088':'tree-workflow-outline',
 'f0742dd69fb00200eb3919eb552e708b':'database-outline',
 'f0742dd69fb00200eb3919eb552e7091':'monitor-outline',
 'f296fe519fa20200ee6219eb552e7045':'database-outline',
 'f4742dd69fb00200eb3919eb552e7089':'globe-outline',
 'f4742dd69fb00200eb3919eb552e708b':'database-outline',
 'f4742dd69fb00200eb3919eb552e708f':'headset-outline',
 'f4742dd69fb00200eb3919eb552e7091':'serverbox-outline',
 'f4742dd69fb00200eb3919eb552e7092':'printer-outline',
 'f696fe519fa20200ee6219eb552e7044':'tree-workflow-outline',
 'f696fe519fa20200ee6219eb552e7046':'tree-workflow-outline',
 'f8742dd69fb00200eb3919eb552e708b':'database-outline',
 'f8742dd69fb00200eb3919eb552e708c':'headset-outline',
 'f8742dd69fb00200eb3919eb552e7090':'harddrive-outline',
 'f8742dd69fb00200eb3919eb552e7091':'lightning-outline',
 'f8742dd69fb00200eb3919eb552e7092':'serverbox-outline',
 'f96e13049f920200ee6219eb552e7007':'database-outline',
 'fa96fe519fa20200ee6219eb552e7043':'tree-workflow-outline',
 'fa96fe519fa20200ee6219eb552e7045':'globe-outline',
 'fa96fe519fa20200ee6219eb552e7046':'folder-outline',
 'fc07357193100200e4e4705bb47ffb72':'database-outline',
 'fc07357193100200e4e4705bb47ffb77':'database-outline',
 'fc742dd69fb00200eb3919eb552e7087':'tree-workflow-outline',
 'fc742dd69fb00200eb3919eb552e7090':'sync-outline',
 'fc742dd69fb00200eb3919eb552e7092':'globe-outline',
 'fd64ac92c32122003263bea192d3aedf':'tag-outline',
 'fe96fe519fa20200ee6219eb552e7045':'serverbox-outline'
 };

for (var key in map) {
    var gr = new GlideRecord('ngbsm_ci_type_icon');
    gr.addQuery('sys_id', key);
    gr.query();
    if(gr.next()){
        gr.setValue('icon_name', map[key]);
        gr.update();
    }
}
})()
