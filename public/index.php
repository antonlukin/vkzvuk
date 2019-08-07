<?php
    require __DIR__ . "/sparrow.php";
    require __DIR__ . "/settings.php";

    $db = new Sparrow();
    $db->setDb($db_config);

    $link = $db->getDB();
    $link->set_charset("utf8");

    $sounds = $db->from('sounds')
            ->where('vkid', '5655655')
            ->many();
?><!doctype html>
<html>
<head>
    <title>vkZvuk</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300&amp;subset=cyrillic" rel="stylesheet">
    <style>
        body {
            background: #000;
            font: 300 16px/1.4 "Ubuntu", sans-serif;
            color: white;
        }

        .title {
            width: 100%;
            padding-bottom: 0.5rem;
            font-weight: 300;
            text-align: left;
        }

        .wrapper {
            display: flex;
            align-item: space-around;
            flex-flow: row wrap;

            width: 100%;
            max-width: 60rem;
            margin: 2rem auto 0;
            padding: 0 1rem;
        }

        .item {
            display: flex;
            align-items: center;
            position: relative;
            width: 25%;
            padding: 10px;

            box-sizing: border-box;
        }

        @media screen and (max-width: 1023px) {
            .item {
                width: 50%;
            }
        }

        @media screen and (max-width: 767px) {
            .item {
                width: 100%;
            }
        }

        .play {
            position: absolute;
            top: 50%;
            left: 10px;

            display: block;
            cursor: pointer;
            width: 0;
            height: 0;
            margin-right: 1rem;

            transition: all .3s linear, border .1s linear;
            transform: translate(0, -50%);
            border-style: solid;
            border-width: 10px 0 10px 10px;
            border-color: transparent transparent transparent #fff;
        }

        .play:hover {
            border-width: 8px 0 8px 8px;
        }

         .play:active {
            border-width: 12px 0 12px 12px;
        }

        .item--current .play {
            width: 8px;
            height: 16px;

            border: solid #fff;
            border-width: 0 3px 3px 0;

            transform: rotate(45deg) translate(-50%, -50%);
        }

        p {
            margin: 5px 0;
        }

        p a {
            color: #7773FF;
            text-decoration: none;
            border-bottom: solid 1px;
            transition: border 0.25s;
        }

        p a:hover {
            border-bottom-color: transparent;
        }

        .item a {
            display: inline-block;
            margin-left: 2rem;

            color: white;
            font-weight: 300;
            text-decoration: none;
            transition: all .3s;
        }
        a:hover {
            color: #7773FF;
        }

        .button {
            display: block;
            margin: 1.5rem 0 2.5rem;
            background-color: #7773FF;
            color: #fff;
            font-size: 1rem;

            padding: 1rem 4rem;
            border-radius: 3px;
            text-decoration: none;
            transition: background 0.25s;
        }

        .button:hover {
            color: #fff;
            background-color: #6250f2;
        }
    </style>
</head>

<body>

    <div class="wrapper">
        <h1 class="title">vkZvuk</h1>

        <p>Сервис vkZvuk работает в тестовом режиме. Все свои вопросы задавайте в <a href="https://vk.me/vkzvuk">личных сообщениях</a> к сообществу Вконтакте.</p>
        <p>Пока расширение доступно только для браузеров, которые совместимы с движком Chromium. Т.е Google Chrome, Яндекс.Браузер, Opera и прочие сборки. </p>
        <p>Сейчас открыт только базовый набор звуков. Но очень скоро библиотека расширится до 3000 мелодий с возможностью загрузить любую свою.</p>

        <a class="button" href="https://chrome.google.com/webstore/detail/vkzvuk/mgdniegdoedpnhojjocdlhmkamngdhgj?hl=ru">Скачать расширение</a>
    </div>

    <div class="wrapper">
<?php
    foreach($sounds as $sound) :
        $path = "{$sound['vkid']}-{$sound['path']}";
?>
        <div class="item" data-sound="<?= $path ?>">
            <b class="play" data-id="<?= $path ?>"></b>
            <a class="set" href="#<?= $path ?>" class="" data-id="<?= $path ?>"><?= $sound['title'] ?></a>
        </div>
<?php endforeach; ?>

    </div>

    <script>
        var editorExtensionId = "mgdniegdoedpnhojjocdlhmkamngdhgj";

        chrome.runtime.sendMessage(editorExtensionId, {current: 'status'}, function(response) {
            var p = document.querySelector('.item[data-sound="' + response.current + '"]');

            p.classList.add("item--current");
        });

        document.querySelectorAll('.set').forEach(function(el){
          el.addEventListener('click', function(e){
            e.preventDefault();

            var p = this.parentNode;
            var id = this.getAttribute('data-id');

            document.querySelectorAll('.item').forEach(function(el) {
                el.classList.remove('item--current');
            });

            p.classList.add('item--current');

            chrome.runtime.sendMessage(editorExtensionId, {sound: id}, function(response) {});

          }, false);
        });

        document.querySelectorAll('.play').forEach(function(el){
          el.addEventListener('click', function(e){
             e.preventDefault();

            var id = this.getAttribute('data-id');
            var audio = document.createElement('audio');

            audio.src = 'https://vkzvuk.ru/sounds/' + id + '.mp3'
            audio.play();

          }, false);
        });
    </script>
</body>
</html>
