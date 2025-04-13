const char = document.getElementById('char'),
    score = document.getElementById('score'),
    gameContainer = document.getElementById('game-container'),
    start = document.getElementById('btn-start'),
    bg1 = document.querySelector('.bg-black1'),
    bg2 = document.querySelector('.bg-black2'),
    wg1 = document.querySelector('.bg-white1'),
    wg2 = document.querySelector('.bg-white2'),
    bgRe = document.querySelector('#btn-restart'),
    gameOverBlock = document.getElementById('game-over'),
    gameOverImage = document.getElementById('game-over-img'),
    gameOverScore = document.getElementById('gameover-score'),
    gameOverMessage = document.getElementById('gameover-meassge'),
    gameOverImageBox = document.querySelector('.img-box2'),
    gameOverFirstImg = document.querySelector('.img-box2 img:first-child');

const bgm = new Audio("music.mp3");
bgm.loop = true;
bgm.volume = 0.02; // 0 ~ 1 사이 (음량 조절)




let scoreUpdate = 0,
    y = gameContainer.offsetHeight - char.offsetHeight,
    x = gameContainer.offsetWidth / 2 - char.offsetWidth / 2,
    Jumping = 0,
    timer = 0,
    lvlSpeedFrame = 120,
    lvlGameSpeed = 1.2,
    isMoveLeft = false,
    isMoveRight = false,
    isFalling = false;

let velocity = 0;
let gravity = 0.5;
let wallArr = [];

bg2.classList.add('close-bg');





start.addEventListener('click', function () {

    start.remove();

    bgm.play();
    char.style.backgroundImage = 'url("imgs/start.gif")';

    setTimeout(() => {
        char.style.backgroundImage = 'url(imgs/front.png)';
    }, 1500);

    wg1.classList.add('close-modal');
    bg1.classList.add('close-bg');

    function gameLoop() {
        timer++;


        if (timer % lvlSpeedFrame === 0) {
            moveWall();
        }



        // 벽 이동
        wallArr.forEach((Platform, index) => {
            Platform.move();  // 각 벽이 이동
            if (Platform.bottom > gameContainer.offsetHeight) {
                gameContainer.removeChild(Platform.element);
                wallArr.splice(index, 1); // 벽이 화면을 벗어나면 배열에서 제거
            }

        });



        Difficulty();
        fallAndPhysics();
        charMove();
        gameOver(char, gameOverBlock);





        // 점수 갱신 함수 수정

        wallArr.forEach((Platform) => {
            const block = Platform.scoreBlock;


            // 캐릭터가 scoreBlock에 닿고, 점수를 올리지 않은 상태일 때 점수 올리기
            if (checkScoreCollision(char, block) && !block.isScored) {
                scoreUpdate++;
                block.isScored = true;  // 점수 올린 상태로 변경
                score.textContent = `현재 점수 : ${scoreUpdate}`;
            }

            // 캐릭터가 플랫폼을 지나가고 나서, 다시 올 때 점수 올리기
            if (char.top < block.bottom && block.isScored) {
                block.isScored = false;  // 점수 초기화
            }
        });

    }



    // 벽 이동 함수

    function moveWall() {
        const newPlatform = document.createElement("div");
        newPlatform.classList.add("platform-wall");

        const newPlatform1 = document.createElement("div");
        newPlatform1.classList.add("platform1");

        const newPlatform2 = document.createElement("div");
        newPlatform2.classList.add("platform2");

        const scoreBlock = document.createElement("div");
        scoreBlock.classList.add("score-block");



        // 고정된 scoreBlock 너비
        const gapWidth = 100; // px
        scoreBlock.style.width = `${gapWidth}px`;


        // 전체 너비 구하기
        const totalWidth = gameContainer.offsetWidth;

        // platform 너비 총합
        const platformTotal = totalWidth - gapWidth;

        const platform1Ratio = Math.random();
        const platform1Width = Math.floor(platformTotal * platform1Ratio);
        const platform2Width = platformTotal - platform1Width;


        newPlatform1.style.width = `${platform1Width}px`;
        newPlatform2.style.width = `${platform2Width}px`;


        newPlatform.appendChild(newPlatform1);
        newPlatform.appendChild(scoreBlock);
        newPlatform.appendChild(newPlatform2);


        gameContainer.appendChild(newPlatform);

        const Platform = {
            element: newPlatform,
            right: 0,
            bottom: -50,
            newPlatform1: newPlatform1,
            newPlatform2: newPlatform2,
            scoreBlock: scoreBlock,
            move: function () {
                this.bottom += lvlGameSpeed;
                this.element.style.bottom = this.bottom + "px";
            }
        };



        wallArr.push(Platform);

    }


    function fallAndPhysics() {
        let onPlatform = false;

        wallArr.forEach((Platform) => {
            if (checkCollision(char, Platform.newPlatform1) || checkCollision(char, Platform.newPlatform2)) {
                if (isFalling) {
                    onPlatform = true;
                    y = Platform.newPlatform1.getBoundingClientRect().top - char.offsetHeight + -5; // 플랫폼 바로 위로 조정 (오차 보정)
                    velocity = 0; // 충돌 시 낙하 속도 초기화
                }

            }

        });


        isFalling = !onPlatform;


        // 중력 적용
        if (isFalling) {
            velocity += gravity;
            y += velocity;

            const maxY = gameContainer.offsetHeight - char.offsetHeight - 10;
            if (y > maxY) {
                y = maxY;
                velocity = 0;
            }
        } else {
            velocity = 0;
        }


        char.style.top = y + "px";

    }





    function charMove(Platform) {

        // 좌우 이동

        if (isMoveLeft) {
            x -= 3;
        } else if (isMoveRight) {
            x += 3;
        }


        // 화면 밖 제한
        if (x < 0) x = 0;
        if (x > gameContainer.offsetWidth - char.offsetWidth) {
            x = gameContainer.offsetWidth - char.offsetWidth;
        }





        // X좌표 적용
        char.style.left = x + "px";
    }


    function Difficulty() {
        if (scoreUpdate >= 100) {
            lvlGameSpeed = 1.3;
            lvlSpeedFrame = 100;
        }

    }
    function checkCollision(rect1, rect2) {
        let rect1Rect = rect1.getBoundingClientRect();
        let rect2Rect = rect2.getBoundingClientRect();

        return (
            rect1Rect.left < rect2Rect.right - 25 &&
            rect1Rect.right > rect2Rect.left + 25 &&
            rect1Rect.top < rect2Rect.bottom &&
            rect1Rect.bottom > rect2Rect.top
        );

    }


    function checkScoreCollision(rect1, rect2) {
        let rect1Rect = rect1.getBoundingClientRect();
        let rect2Rect = rect2.getBoundingClientRect();


        return (
            rect1Rect.top < rect2Rect.bottom &&
            rect1Rect.bottom > rect2Rect.top
        );

    }

    // 게임오버 함수
    function gameOver(rect1, rect2) {
        let frame = requestAnimationFrame(gameLoop);

        let rect1Rect = rect1.getBoundingClientRect();
        let rect2Rect = rect2.getBoundingClientRect();
        if (
            rect1Rect.left < rect2Rect.right &&
            rect1Rect.right > rect2Rect.left &&
            rect1Rect.top < rect2Rect.bottom &&
            rect1Rect.bottom > rect2Rect.top
        ) {
            cancelAnimationFrame(frame);
            bgRe.style.display = 'block';
            bg2.classList.remove('close-bg');
            wg2.classList.add('show-modal');
            bgm.pause();
            if (scoreUpdate <= 200) {
                gameOverImage.src = "imgs/gameover.png";
                gameOverImage.style.width = "250px"
                gameOverImage.style.height = "75px"
                gameOverScore.textContent = `점수 : ${scoreUpdate}`;
                gameOverMessage.textContent = "하.. 야근 ㅠㅠㅠ";
                gameOverImageBox.style.bottom = "200px";
                gameOverImageBox.style.animation = 'over 0.1s steps(1) infinite alternate';
            }
            else if (scoreUpdate >= 200) {
                gameOverImage.src = "imgs/Dance.gif";
                gameOverScore.textContent = `점수 : ${scoreUpdate}`;
                gameOverMessage.textContent = "200점이닭!! 오늘은 칼퇴닷!!!";
                gameOverFirstImg.remove();
            }

        }

    }



    // 키 입력 처리
    setTimeout(() => {
        document.addEventListener("keydown", function (e) {
            if (e.code === "ArrowLeft") {
                isMoveLeft = true;
                char.style.backgroundImage = 'url("imgs/running.gif")';
                char.style.transform = "scaleX(1)"; // 왼쪽 보기
            } else if (e.code === "ArrowRight") {
                isMoveRight = true;
                char.style.backgroundImage = 'url("imgs/running.gif")';
                char.style.transform = "scaleX(-1)"; // 오른쪽 보기
            }
        });


        document.addEventListener("keyup", function (e) {
            if (e.code === "ArrowLeft") {
                isMoveLeft = false;
            } else if (e.code === "ArrowRight") {
                isMoveRight = false;
            }

            // 양쪽 다 멈췄으면 기본 자세로
            if (!isMoveLeft && !isMoveRight) {
                // clearInterval(walkInterval);
                // walkInterval = null;
                char.style.backgroundImage = 'url("imgs/front.png")';
            }
        });
    }, 1500);




    bgRe.addEventListener('click', function () {
        location.reload();
    });


    // 게임 루프 시작
    gameLoop();

});