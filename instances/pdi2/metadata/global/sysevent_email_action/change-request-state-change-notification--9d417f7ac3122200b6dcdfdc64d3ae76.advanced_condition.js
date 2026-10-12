var cr = new ChangeRequest(current);
answer = (cr.changesToScheduled() || cr.changesToImplement() || cr.changesToReview() || cr.changesToCanceled());
