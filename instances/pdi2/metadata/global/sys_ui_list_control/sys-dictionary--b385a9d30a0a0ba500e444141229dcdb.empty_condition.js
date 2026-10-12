var answer = parent.element.nil();
if (!answer)
   answer = !GlideDBObjectManager.get().hasExtensions(parent.name);

answer;
