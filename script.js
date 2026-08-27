/* ===================================
   PLAYER
=================================== */

const player = document.getElementById("player");

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

const speed = 4;

const keys = {};


/* ===================================
   KEYBOARD
=================================== */

document.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    // SPACE
    if (event.code === "Space") {

        event.preventDefault();

        interact();
    }

});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


/* ===================================
   PLAYER MOVEMENT
=================================== */

function updatePlayer() {

    if (keys["w"] || keys["arrowup"]) {
        playerY -= speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        playerY += speed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        playerX -= speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        playerX += speed;
    }


    // 화면 밖으로 나가지 못하게 함

    const halfWidth = 21;
    const halfHeight = 32;

    playerX = Math.max(
        halfWidth,
        Math.min(window.innerWidth - halfWidth, playerX)
    );

    playerY = Math.max(
        halfHeight,
        Math.min(window.innerHeight - halfHeight, playerY)
    );


    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}


/* ===================================
   INTERACTION
=================================== */

function interact() {

    const objects = document.querySelectorAll(".object");

    let nearestObject = null;
    let nearestDistance = Infinity;


    objects.forEach((object) => {

        const rect = object.getBoundingClientRect();

        const objectX =
            rect.left + rect.width / 2;

        const objectY =
            rect.top + rect.height / 2;


        const distance = Math.sqrt(
            Math.pow(playerX - objectX, 2) +
            Math.pow(playerY - objectY, 2)
        );


        if (distance < nearestDistance) {

            nearestDistance = distance;
            nearestObject = object;

        }

    });


    const dialogue =
        document.getElementById("dialogue-text");


    if (nearestObject && nearestDistance < 100) {

        dialogue.textContent =
            nearestObject.dataset.message;

    }

    else {

        dialogue.textContent =
            "주변에 조사할 수 있는 것이 없다.";

    }

}


/* ===================================
   GAME LOOP
=================================== */

function gameLoop() {

    updatePlayer();

    requestAnimationFrame(gameLoop);

}


/* ===================================
   START
=================================== */

gameLoop();