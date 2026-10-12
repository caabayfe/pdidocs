gs.include("DomainManager");

var dm = new DomainManager();
if (current.operation() == 'insert')
    dm.addInheritedDomains(current);
else
    dm.removeInheritedDomains(current);
