// Set the default width and height from the activity defintion
if (current.width.nil())
   current.width = current.activity_definition.default_width;

if (current.height.nil())
   current.height = current.activity_definition.default_height;
   
// If this is a container activity, set the is_parent flag to true
var attributes = current.activity_definition.attributes;
if (attributes && GlideStringUtil.decodeAttributes(attributes).containsKey("container"))
   current.is_parent = true;
