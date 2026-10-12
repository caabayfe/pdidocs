var url = 'ml_similarity_example_list.do?';
url += 'sysparm_query=solution='+current.sys_id;
url += '^ORDERBYDESCsimilarity_score';
action.setRedirectURL(url);
