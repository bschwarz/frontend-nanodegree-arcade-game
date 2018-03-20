'use strict';

//
//============================================================
// Class: Enemy
//   enemies our player must avoid
//============================================================
//
let Enemy = function(row) {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    this.row = row;
    this.x = -CELL_WIDTH; // start off screen
    this.y = row*CELL_HEIGHT - IMG_OFFSET; // find y based on the row

    // use a speed function so that we can increase speed for next level
    this.speed = this.getSpeed(topSpeed);

};

//
//**************************************************************
// Method: Enemy.speed
//
//   get random speed, based on top speed
//**************************************************************
//
Enemy.prototype.getSpeed = function(top) {
    return Math.floor(Math.random() * top) + top - 5;
};

//
//**************************************************************
// Method: Enemy.update
//
//  Update the enemy's position, required method for game
//  Parameter: dt, a time delta between ticks
//**************************************************************
//
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x += this.speed * dt;
    // if enemy is at right edge, have them wrap around
    if (this.x > ctx.canvas.width) {
        this.x = -CELL_WIDTH;
    }

    this.checkCollisions();
};

//
//**************************************************************
// Method: Enemy.checkCollisions
//**************************************************************
//
Enemy.prototype.checkCollisions = function() {

    // Check for collision of each enemy with the player
    let deltax = this.x-player.x;
    let deltay = this.y-player.y;
    if(Math.abs(deltax) <= IMG_OFFSET && Math.abs(deltay) <= IMG_OFFSET) {

        lives -= 1;

        if (lives) {
            if (player.level > 1) {
                player.level -= 1;
                player.score -= player.level;
                topSpeed -= 5;
            }

            message = "OUCH!!";
            setTimeout(function(){message = '';}, 1000);
        } else {
            message = "Game Over!!";
            player.renderLives();

            setTimeout(function(){
                topSpeed = 180;
                player.score = 0;
                player.level = 1;
                state = 'start';
                message = 'New Game';
                lives = 3;
            }, 2000);

            // Resets number of enemies back to three
            allEnemies = allEnemies.slice(0,3);

            setTimeout(function(){message = '';}, 3000);
        }

        allEnemies.forEach(function(enemy) {
            enemy.reset();
        });
        player.reset();
    }
};


//
//**************************************************************
// Method: Enemy.render
//
//**************************************************************
//
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//
//**************************************************************
// Method: Enemy.reset
//**************************************************************
//
Enemy.prototype.reset = function() {
    this.x = -CELL_WIDTH;
    this.speed = this.getSpeed(topSpeed);
};





//
//================================================
// Class: Player
//
//================================================
//
let Player = function() {
    this.sprite = 'images/char-boy.png';

    // Start at bottom row, in the middle
    this.x = CELL_WIDTH * 2;
    this.y = 5*CELL_HEIGHT-IMG_OFFSET;

    // define the edges for each direction, for edge detection
    this.edge = {
        'left': CELL_WIDTH,
        'up': IMG_OFFSET,
        'right': CELL_WIDTH*4,
        'down': CELL_HEIGHT*4+IMG_OFFSET
    };

    this.score = 0;
    this.level = 1;
};


//
//****************************************************
// Method: Player.update
//****************************************************
//
Player.prototype.update = function() {
    //no-op
};

//
//****************************************************
// Method: Player.render
//****************************************************
//
Player.prototype.render = function() {

    // Text for the Score and Level headings
    ctx.font = "25pt Permanent Marker";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + this.score, 10, ctx.canvas.height-25);
    ctx.fillText("Level: " + this.level, 10,85);

    this.renderLives();

    // Text for the Game Status on screen (i.e. Game Over)
    ctx.save();
    ctx.font = "50pt Permanent Marker";
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'blue';
    ctx.fillText(message, ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.strokeText(message, ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.restore();

    // Draw the player
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//
//****************************************************
//  Method: Player.renderLives
//****************************************************
//
Player.prototype.renderLives = function() {

    // Loop through each life left and render on screen
    let xoff = 35;
    for (let i = 1; i <= lives; i++) {
        ctx.drawImage(Resources.get(this.sprite), ctx.canvas.width-xoff, 35, 30, 60);
        xoff += 40;
    }
};

//
// ****************************************************
//  Method: Player.handleInput
// ****************************************************
//
Player.prototype.handleInput = function(key) {

    let self = this;

    // Handle the key press and check if the location is at an edge first
    // before moving the coords.
    //
    // **Note**: The below allows for the player to wrap around to the left
    // or right, once the player reaches the right or left edge. The Rubric
    // mentions that player can not move off screen. If this ability violates
    // that requirement, I can change so that it doesn't wrap. I just think
    // wrapping allows a different dimension to the game.
    //
    switch (key) {
        case 'left':
            if (this.x < this.edge[key]) {
                this.x = this.edge.right;
            } else {
                this.x -= CELL_WIDTH;
            }
            break;
        case 'up':
            if (this.y > this.edge[key]) {
                this.y -= CELL_HEIGHT;
            }
            break;
        case 'right':
            if (this.x>= this.edge[key]) {
                this.x = 0;
            } else {
                this.x += CELL_WIDTH;
            }
            break;
        case 'down':
            if (this.y < this.edge[key]) {
                this.y += CELL_HEIGHT;
            }
            break;
    }

    // check if the player has made it to the water, and
    // if so, send Won message, then reset
    if (this.y <= this.edge.up && state != 'won') {
        state = 'won';
        message = 'Good Job!!';

        let self = this;
        setTimeout(function(){
            // score grows by level amount;
            self.score += self.level;
            self.level += 1;
            // if not multiple of 5, just increase speed
            // else if multiple of 5 then add enemy
            if (self.level % 5) {
                topSpeed += 5;
            } else {
                let row = allEnemies.length % 3 + 1;
                allEnemies.push(new Enemy(row));
            }
            self.reset();
            allEnemies.forEach(function(enemy) {
                enemy.reset();
            });
            state = 'start';
            message = '';
        }, 2000);
    }
};

//
// ****************************************************
//  Method: Player.reset
// ****************************************************
//
Player.prototype.reset = function() {
    this.x = CELL_WIDTH * 2;
    this.y = 5*CELL_HEIGHT-IMG_OFFSET;
}

// Global varaibles
let topSpeed = 180;
const IMG_OFFSET = 25;
let state = 'start';
let message = '';
let lives = 3;
// **  from engine.js
// width of column = 101
// height of row = 83
const CELL_WIDTH = 101;
const CELL_HEIGHT = 83;


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [new Enemy(1), new Enemy(2), new Enemy(3)]; //creates an array of Enemies

let player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
