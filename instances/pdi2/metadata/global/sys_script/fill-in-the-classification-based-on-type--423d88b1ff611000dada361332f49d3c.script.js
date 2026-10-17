/**
 Service-now.com
 
 Description: Automatically fill in the credential classification based on type
**/

if (current.type == "ssh_private_key")
    current.classification = "ssh"
else
    current.classification = current.type;
