---
title: Rate an article or say what is wrong
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center, a knowledge article (esc?id=kb_article_view)
    how: opened a published article
    result: 'header: Actions › Flag Article; footer: Helpful? Yes / No; Rate this article (5 stars); Post a comment…'
  E02:
    record: sp_widget/5f599c490be432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Helpful
    result: 'Yes or No is saved as your helpful vote; "Thank you for your feedback!"; a star rating is saved on its own; it asks for a reason only when glide.knowman.feedback.enable_actionable_feedback_for_helpful is true (for No) or a rating threshold is set'
    hash: 95b5b0d15385d0edad25bfac3dabdb10b5eff82cf28de5da70b5180e1286f3a1
  E03:
    record: sys_properties/a7cc6dfa53730300cc376512a2dc34ac
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_helpful
    result: 'false: answering No asks no question'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E04:
    record: sys_properties/b9bde13e53730300cc376512a2dc34bb
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_rating
    result: 'empty: no star rating asks for a reason'
    hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  E05:
    record: sp_ng_template/b092dada0b4132004ce28ffe15673a35
    how: read kb-flag-article-modal, with the messages of Knowledge Article Content (sp_widget/a47ea1cb0b9432004ce28ffe15673a5b)
    result: '"Flag this article", a box "Add a comment (mandatory)", Cancel and Submit; without a comment "Please provide a comment to flag the article"; afterwards "Article has been flagged"'
    hash: a583856cf3eea4a7f4ce5dfcd09621fd8468ca6c9ac0a31a394275e4bcb2d7d5
  E06:
    record: sys_script_include/eed75435eb7121007128a5fc5206fe93
    field: script
    how: read KBAjaxSNC.kbWriteCommentWithParams
    result: a flag is saved with your comment and, because glide.knowman.feedback.enable_actionable_feedback_for_flag is true, the reason Other
    hash: ea2fff4ac1ec64ff66ffc465d7dc5198898089146cc2e1f1dc45ff84b622f33a
  E07:
    record: sys_script/3cf9004d67101300d358bb2d07415a62
    how: read Knowledge Feedback Task Creation (after insert on kb_feedback, when a reason is given)
    result: feedback with a reason creates a knowledge feedback task; its description is your comment
    hash: c9c2c10cb703b7ab9673f306154c05bc7e90e484edb0e7931d31feb6412e60b2
  E08:
    record: sp_widget/077810090be432004ce28ffe15673adb
    field: script
    how: read Knowledge Article Comments, with its options on the article page (sp_instance/72b67706239033007e45ff5e17bf65f4)
    result: '"Post a comment", Submit, "Comment posted."; replies and likes; you can delete your own ("Deleting this post can''t be undone. Do you still want to delete it?"); up to 3 attachments of 2 MB'
    hash: f64c7c858eb7bab3a556f708ef0b9a7fc17e5092cde30a580d8bebaa1cbc4b56
  E09:
    record: sys_properties/c9b357af0a0a0b82008cba97a078daca
    field: value
    how: read glide.knowman.show_user_feedback
    result: 'onload: comments are shown on the article to every reader'
    hash: 6ac7d5df1133633bd7e8ba8472e3c0e0c99a0a0be8db3aaf2924c269723b13ba
  E10:
    record: sysevent_email_action/0a0e1b2867101300d358bb2d07415a7b
    how: 'read KM Feedback Task: Info from Submitter, with its mail script (sys_script_email/a05e9b2867101300d358bb2d07415a2e)'
    result: '"Feedback Task … has been updated": "We need more information in order to process your feedback on article …", with a link "here" to the task'
    hash: 9c0a041947463cde6e87800297f355749fe0b04a5cae86729d704836a913828c
  E11:
    record: sysevent_email_action/0178bf8b67330300d358bb2d07415adc
    how: 'read KM Feedback Task: Resolved, with its mail script (sys_script_email/1fa9b3cb67330300d358bb2d07415a43)'
    result: '"Your Feedback Task … has been resolved": "The feedback you submitted … was resolved. Please review and accept."'
    hash: eb7e4eb810fd59126ddcf4d578b87219ffb958269db873adb5eca5a2ac4d58de
  E12:
    record: sys_ui_action/92c3f74b67330300d358bb2d07415af3
    field: condition
    how: read Accept, and Reject (sys_ui_action/b8043b4b67330300d358bb2d07415ac0)
    result: shown only to the person who gave the feedback, on a Resolved task; Accept closes it, Reject sends it back to the author
    hash: 13ccbe52294bb8d9d47d2858b8f0b8fbdfee48ead8b3741e50d3b18642262b99
  E13:
    record: sys_script/9e86eb3d0a0a0b4101e402ebc4111862
    how: read Calculate Article Rating, with Populate Helpful Count (sys_script/f06b361dc71230108ad4010703c26044)
    result: the article's average star rating and its helpful count are recalculated from the votes
    hash: 29be806cde7b54a11e3a5ba44bd13270350e37241c0591bfb6971dad1baa7f40
---
Tell the authors whether an article helped. A vote or a few stars take a second; a **flag** with
a comment tells them what to fix, and they write back when it is done.

## Before you start

You are on an article in Employee Center: see [Find and read an article](see:find). The
**Helpful?**, **Rate this article** and **Post a comment** options are at the bottom of the
article; **Flag Article** is under **Actions** at the top. [E01]

## Say whether it helped

1. At the bottom of the article, answer **Helpful?** with **Yes** or **No**. [E01]
2. You see *"Thank you for your feedback!"*. [E02]

## Give it stars

1. Under **Rate this article**, choose one to five stars. [E01]
2. You see *"Thank you for your feedback!"*. The article's average rating, shown at its top, is
   updated. [E02] [E13]

A **No** or a low rating is counted, but nobody is asked to act on it and nobody writes back. [E03]
[E04] [Q02] To have something fixed, flag the article.

{{animation:kbfeedback}}

## Flag an article that is wrong

1. At the top of the article, open **Actions** and choose **Flag Article**. [E01]
2. **Flag this article** opens. Write what is wrong in **Add a comment (mandatory)**: what is
   incorrect, missing or unclear, and what you expected. [E05] [Q45]
3. Press **Submit**. You see *"Article has been flagged"*. [E05]

Your flag goes to the article's author as a task, with your comment. [E06] [E07]

## Comment on an article

1. At the bottom, choose **Post a comment**, write it and press **Submit**: *"Comment
   posted."* [E08]
2. You can reply to and like other readers' comments, attach up to three files, and delete your
   own comments. [E08]

Comments are visible to everyone who reads the article. [E09] A comment is not a flag: nobody is
asked to act on it. [E07] To have something fixed, flag the article.

## What happens next

| When | You get |
|---|---|
| The author needs more from you | *"Feedback Task … has been updated"*: "We need more information in order to process your feedback on article …", with a link to answer [E10] |
| The author has acted on your flag | *"Your Feedback Task … has been resolved"*: "The feedback you submitted … was resolved. Please review and accept." [E11] |

When it is resolved, open the link in the email and choose **Accept** if the article is now
right, or **Reject** if it isn't: it goes back to the author. [E12] [Q01] [Q04] [Q33]

## Tips

- One problem per flag, and say exactly where it is in the article.
- Flag rather than comment when something must change: only a flag reaches the author.
- Use stars and **Helpful?** on every article you read: they decide which articles appear as
  most useful and top rated. [E13]

## I want to…

| I want to… | Go to |
|---|---|
| find another article | [Find and read an article](see:find) |
| ask IT for help instead | [Report an incident](see:incident/report) |
| see which emails knowledge sends | [Who is told what](see:who-is-told) |
