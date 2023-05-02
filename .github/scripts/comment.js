module.exports = async ({ github, context, header, body }) => {
    console.log("script start escape");
    const comment = [header, body].join("\n");
    console.log("script comment");
    const { data: comments } = await github.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.number,
    });
    console.log("script comments", comments);
    let botComment = null;
    if(comments) {
        botComment = comments.find(
            (comment) =>
              // github-actions bot user
              comment.user.id === 41898282 && comment.body.startsWith(header)
          );
    }
    
    console.log("script botComment", botComment);
    const commentFn = botComment ? "updateComment" : "createComment";
    console.log("script commentFn", commentFn);
    await github.rest.issues[commentFn]({
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: escape(comment),
      ...(botComment
        ? { comment_id: botComment.id }
        : { issue_number: context.payload.number }),
    });
  };
