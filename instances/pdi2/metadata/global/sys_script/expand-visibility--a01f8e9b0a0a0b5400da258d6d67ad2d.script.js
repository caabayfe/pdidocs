gs.include("DomainManager");

var dm = new DomainManager();
if (current.operation() == 'insert')
    dm.addIncludedDomain(current);
else
    dm.removeIncludedDomain(current);        
