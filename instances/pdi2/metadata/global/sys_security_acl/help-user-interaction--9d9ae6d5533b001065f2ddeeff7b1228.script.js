var guidanceType = current.guidance && current.guidance.type && current.guidance.type.toString();
answer = guidanceType && (guidanceType === 'global_setup' || guidanceType === 'personal_setup');
