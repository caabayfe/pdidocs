if (GlideStringUtil.notNil(new JavaScriptCommentStripper().stripComments(current.getValue('script'))))
	current.advanced = true;
else
	current.advanced = false;
