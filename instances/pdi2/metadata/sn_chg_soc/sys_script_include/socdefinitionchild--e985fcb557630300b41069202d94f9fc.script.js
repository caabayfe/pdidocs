var SoCDefinitionChild = Class.create();
SoCDefinitionChild.prototype = Object.extendsObject(SoCDefinitionChildSNC,{

    type: 'SoCDefinitionChild'
});

SoCDefinitionChild.findByDefId = SoCDefinitionChildSNC.findByDefId;
SoCDefinitionChild.getRequiredFields = SoCDefinitionSNC.getRequiredFields;
