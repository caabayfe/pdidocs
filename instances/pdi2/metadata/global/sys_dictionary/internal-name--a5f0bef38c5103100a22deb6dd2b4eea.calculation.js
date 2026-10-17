answer = (function() {
 if (!current.from_resource.resource_name.nil() && !current.to_resource.resource_name.nil())
 return current.from_resource.resource_name + "__" + current.to_resource.resource_name;
 return "";
})();
