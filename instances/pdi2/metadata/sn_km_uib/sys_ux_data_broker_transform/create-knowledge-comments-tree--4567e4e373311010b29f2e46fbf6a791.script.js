function transform(input) {
    var has = function(object, property) {
        return object != null && object.hasOwnProperty(property);
    };

    var merge = function(target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    };

    var buildTree = function(comments) {
        var commentsTree = {};

        try {
            comments.forEach(function(x) {
                if (has(commentsTree, x.id)) {
                    commentsTree[x.id] = merge(commentsTree[x.id], x);
                } else {
                    commentsTree[x.id] = x;
                    commentsTree[x.id].children = [];
                }

                if (has(commentsTree, x.parent))
                    commentsTree[x.parent].children.push(commentsTree[x.id]);
                else {
                    commentsTree[x.parent] = {
                        children: [commentsTree[x.id]]
                    };
                }
            });
            return commentsTree;
        } catch (e) {
            return commentsTree;
        }
    };
	
	var addActions = function(comments) {
		var knowledge = new GlideRecordSecure('kb_knowledge');
		knowledge.get(input.articleId);
		var knowledgeBase = knowledge.kb_knowledge_base.getRefRecord();
		
		var kbKnowledge = new global.KBKnowledge();
		var isKnowledgeBaseOwner = kbKnowledge.isKnowledgeBaseOwner(knowledgeBase, 'owner');
		var isKnowledgeAdmin = kbKnowledge.isAdminUser(knowledgeBase);
		
		if(!(isKnowledgeBaseOwner || isKnowledgeAdmin)) {
			comments.map(function(comment) {
				if(!(comment.user.id == gs.getUser().getID())) {
					comment.actions = [{
						'id': 'delete',
						'isHidden': true
					}];
				}
			});
		}
		
		return comments;
	};

    var root = addActions(input.root.data.AppKnowledge_Query.getComments);
    var nested = addActions(input.nested.data.AppKnowledge_Query.getComments);
    var tree = buildTree(nested);

    for (var i = 0; i < root.length; i++) {
        var id = root[i].id;

        if (has(tree, id)) {
            root[i].children = tree[id].children;
        } else {
            root[i].children = [];
        }
    }

    return root;
}
