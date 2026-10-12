var DynamicChoiceReferenceListUtil = Class.create();
DynamicChoiceReferenceListUtil.prototype = {
    initialize: function() {},
    getRefQualifierNamespace: function(attributeNamespace, categoryNamespace) {
        if (attributeNamespace)
            return 'name='+attributeNamespace;
        else if (categoryNamespace)
            return 'name='+categoryNamespace;
        else
            return "";
    },
	getRefQualifierAttribute: function(namespace, categoryNamespace) {
        if (namespace)
            return 'namespace='+namespace;
        else if (categoryNamespace)
            return 'namespace='+categoryNamespace;
        else
            return "";
    },
	getRefQualifierCategory: function(namespace, attributeNamespace) {
        if (namespace)
            return 'namespace='+namespace;
        else if (attributeNamespace)
            return 'namespace='+attributeNamespace;
        else
            return "";
    },
    type: 'DynamicChoiceReferenceListUtil'
};
