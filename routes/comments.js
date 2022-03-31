const express = require("express");
const Comment = require("../schemas/comment");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

// 댓글작성
router.post("/comments", authMiddleware, async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  let date = year + "-" + month + "-" + day;

  const password = 0;
  const author = res.locals.user[0].nickname;

  const { content, articleId } = req.body;
  if (!(content && articleId)) {
    return res
      .status(400)
      .json({ success: false, errorMessage: "내용을 입력해주세요" });
  }
  await Comment.create({ articleId, author, password, content, date });
  res.status(201).json({ success: true, message: "댓글이 등록되었습니다" });
});

router.get("/comments/:articleId", async (req, res) => {
  const { articleId } = req.params;
  const comments = await Comment.find({ articleId }, { password: 0 }).sort({
    _id: 1,
  });
  res.json({
    comments,
  });
});

//댓글수정
router.put("/comments/:commentId", authMiddleware, async (req, res) => {
  const { commentId } = res.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false });
  }

  const author = res.locals.user[0].nickname;
  const comment = await Comment.findOne({ _id: commentId, author });

  if (!comment) {
    return res.status(400).send({ errorMessage: "본인의 댓글이 아닙니다" });
  }

  await Comment.updateOne({ _id: commentId, author }, { $set: { content } });
  res.json({ success: true, message: "댓글이 수정되었습니다" });
});

//댓글삭제
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  const { commentId } = req.params;

  const author = res.locals.user[0].nickname;
  await Comment.deleteOne({ _id: commentId, author });
  res.json({ success: true, message: "댓글이 삭제되었습니다" });
});

module.exports = router;
