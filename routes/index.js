const express = require('express');
const path = require('path');
const router = new express.Router();

const models = require('../models');
const verify = require('../utils/verify');

/**
 * Main page route
 */
router.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/index.html'));
});

router.get('/catalog/', async (req, res) => {
  try {
    const sounds = await models.sound.findAll({
      limit: 100,
    });

    res.json(sounds);
  } catch (err) {
    return next(err);
  }
});

/**
 * Upload sound route
 */
router.post('/upload/', async (req, res, next) => {
  if (!req.body.title) {
    return res.answer(false, 400, 'Не задано название звука');
  }

  const title = req.body.title;

  if (!title.match(/^[А-ЯA-Z0-9-_ё\s]+$/iu)) {
    return res.answer(false, 400, 'Неподходящее название звука');
  }

  if (!req.files) {
    return res.answer(false, 400, 'Файл не найден');
  }

  const file = req.files.sound || {};

  if ('audio/mpeg' !== file.mimetype) {
    return res.answer(false, 400, 'Неверный формат файла');
  }

  const user = verify(req.body);

  if (null === user) {
    return res.answer(false, 400, 'Не удалось авторизовать пользователя');
  }

  try {
    let name = await models.sound.max('name', {
      where: {
        vkid: user,
      }
    });

    name = name + 1;

    // Save file to user directory
    file.mv(path.join(__dirname, `/../uploads/${user}/${name}.mp3`));

    await models.sound.create({
      vkid: user,
      name: name,
      title: req.body.title,
      original: file.name,
    });
  } catch (err) {
    return next(err);
  }

  res.answer(true);
});

module.exports = router;
