if ((parent.type == 'snc_external' && (gs.hasRole('next_experience_admin') && gs.hasRole("admin"))) || gs.hasRole("maint"))
    {
        answer = true;
    } else 
        answer = false;
