const express = require("express");
const User = require("../schemas/user");
const router = express.Router();
const Joi = require("Joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");

//회원가입 양식
const postUsersSchema = Joi.object({
  nickname: Joi.string().required().pattern(new RegExp("[a-zA-Z0-9]{2,}")),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().required(),
});

//회원가입
router.post("/users", async (req, res) => {
  try {
    const { nickname, password, confirmPassword } =
      await postUsersSchema.validateAsync(req.body);

    if (password !== confirmPassword) {
      return res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다",
      });
    }

    const existUsers = await User.find({ nickname });
    if (existUsers.length) {
      return res.status(400).send({
        errorMessage: "중복된 닉네임이 존재합니다",
      });
    }

    const user = new User({ nickname, password });
    await user.save();
    res.status(201).send({});
  } catch (error) {
    return res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다",
    });
  }
});

// 로그인
router.post("/auth", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({ nickname, password });

  if (!user) {
    return res.status(400).send({
      errorMessage: "닉네임 또는 비밀번호를 확인해주세요",
    });
  }
  const token = jwt.sign({ nickname: user.nickname }, "youngho22");
  res.send({ token });
});

//정보 조회
router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    nickname: user[0].nickname,
  });
});

module.exports = router;
