(function(){
    var skillConfigGr = new GlideRecord('sn_nowassist_skill_config');
    skillConfigGr.query();

    while (skillConfigGr.next()){
        if(!skillConfigGr.getValue('internal_name')){
			try{
				var internalName= NAASkillConfigUtil._getInternalName(skillConfigGr);
				skillConfigGr.setValue("internal_name",internalName);
				skillConfigGr.update();
			}catch(error){
				gs.info("NAA Fix script: Error while for setting internal name");
			}
        }
    }
})();
