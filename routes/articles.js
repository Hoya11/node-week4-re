const express = require("express");
const Article = require("../schemas/article");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

// 게시글 목록
router.get("/articles", async (req, res) => {
  const articles = await Article.find({}, { password: 0 }).sort({ _id: -1 });
  res.json({
    articles,
  });
});

// 게시글 상세 조회
router.get("/articles/:_id", async (req, res) => {
  const { _id } = req.params;
  const [article] = await Article.find({ _id }, { password: 0 });
  res.json({
    article,
  });
});

// 게시글 작성
router.post("/articles", authMiddleware, async (req, res) => {
  // 오늘 날짜 입력
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  let date = year + "-" + month + "-" + day;

  const password = 0;
  const author = res.locals.user[0].nickname;
  const { title, content } = req.body;
  if (!(title && content)) {
    return res.status(400).json({ success: false });
  }
  await Article.create({ author, password, title, content, date });
  res.status(201).json({ success: true, message: "작성 완료되었습니다." });
});

// 게시글 수정
router.put("/articles/:_id", authMiddleware, async (req, res) => {
  const { _id } = req.params;
  const { title, content } = req.body;
  if (!(title && content)) {
    return res.status(400).json({ success: false });
  }
  const author = res.locals.user[0].nickname;
  const article = await Article.findOne({ _id, author });
  if (!article) {
    return res.status(400).send({ errorMessage: "본인의 글이 아닙니다." });
  }
  // password가 틀리면 메시지 보냄
  // const [article] = await Article.find({ _id }, { password: 1 })
  // if (article.password != password) {
  //     return res.status(400).json({ success: false })
  // }
  await Article.updateOne({ _id }, { $set: { title, content } });
  res.json({ success: true, message: "게시글이 수정되었습니다." });
});

// 게시글 삭제
router.delete("/articles/:_id", authMiddleware, async (req, res) => {
  const { _id } = req.params;
  // password가 틀리면 메시지 보냄
  // const [article] = await Article.find({ _id }, { password: 1 })
  // if (article.password != password) {
  //     return res.status(400).json({ success: false })
  // }
  const author = res.locals.user[0].nickname;
  const article = await Article.findOne({ _id, author });
  if (!article) {
    return res.status(400).send({ errorMessage: "본인의 글이 아닙니다." });
  }
  await Article.deleteOne({ _id, author });
  res.json({ success: true, message: "게시글이 삭제되었습니다." });
});

module.exports = router;
