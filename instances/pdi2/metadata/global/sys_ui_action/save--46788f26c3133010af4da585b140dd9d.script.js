var currentColumnSysID = current.schema;
var currentAttributeName = getAttributeName(current.attribute);
if((currentAttributeName == 'use_legacy_glideencrypter' || currentAttributeName == 'use_instance_level_glideencrypter') && typeof currentColumnSysID != 'undefined'){
	if(isLegacyPasswordAttributePresent(parent)){
		//add an error message and dont save for use_legacy_glideencrypter
		if(currentAttributeName == 'use_legacy_glideencrypter'){
			var errMsg = gs.getMessage("The attribute use_legacy_glideencrypter will not be saved since this field already has the attribute is_legacy_password2");
			gs.addErrorMessage(errMsg);
		}
		else{
			//save for use_instance_level_glideencrypter
			GlideCacheManager.flush("kmf_glide_encrypter_cache");
			saveRecord();
		}
	} else{
		//add an error message and dont save for use_instance_level_glideencrypter
		if(currentAttributeName == 'use_instance_level_glideencrypter'){
			var errMsg2 = gs.getMessage("The attribute use_instance_level_glideencrypter will not be saved since this field doesn't have the attribute is_legacy_password2");
			gs.addErrorMessage(errMsg2);
		}
		else{
			//save for use_legacy_glideencrypter
			GlideCacheManager.flush("kmf_glide_encrypter_cache");
			saveRecord();
		}
			
	}
} else{
	//save
	saveRecord();
}

function getAttributeName(sysIdAttr){
	var ssaGR = new GlideRecord('sys_schema_attribute');
	ssaGR.addQuery('sys_id', sysIdAttr);
	ssaGR.query();
	if(ssaGR.next())
		return ssaGR.getValue('name');
}

function isLegacyPasswordAttributePresent(parent){
	var attributeToSearch = 'is_legacy_password2';
	var attributesString = parent.attributes;
	if(attributesString.includes(attributeToSearch))
		return true;
	return false;
}

function saveRecord(){
	if(current.isNewRecord()){
		action.setRedirectURL(current);
		current.insert();	
		gs.include('ActionUtils');
		var au = new ActionUtils();
		au.postInsert(current);
	}
	else{
		action.setRedirectURL(current);
		current.update();
	}
}
