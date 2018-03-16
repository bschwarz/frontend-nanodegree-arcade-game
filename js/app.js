// Enemies our player must avoid
var Enemy = function(row) {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    //**  from engine.js
    // width of column = 101
    // height of row = 83
    this.row = row;
    this.x = -cellWidth;
    // Will add enemy in the row that is passed into this function
    this.y = row*cellHeight - imgOffset;
    // use a speed function so that we can increase speed for next level
    this.speed = this.getspeed(topspeed);

};

// ****************************************************
//  Speed method - get random speed, based on top speed
// ****************************************************
Enemy.prototype.getspeed = function(top) {
    return Math.floor(Math.random() * top) + top - 5;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x += this.speed * dt;    
    if (this.x > ctx.canvas.width) {
        this.x = -cellWidth;
    }

    if(this.x >= player.x - imgOffset && this.x <= player.x + imgOffset) {
        if(this.y >= player.y - imgOffset && this.y <= player.y + imgOffset) {
            allEnemies.forEach(function(enemy) {
                enemy.reset();
            });
            if (level > 1) {
                score -= level;
                level -= 1;
                topspeed -= 5;
            }
            
            player.reset();
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.reset = function() {
    this.x = -cellWidth;
    this.speed = this.getspeed(topspeed);
};



// ****************************************************
//  Player Class
// ****************************************************
var Player = function(x, y) {
    this.sprite = 'images/char-boy.png';

    // Start at bottom row, in the middle
    this.x = cellWidth * 2;
    this.y = 5*cellHeight-imgOffset;

    // define the edges for each direction, for edge detection
    this.edge = {
        'left': cellWidth, 
        'up': imgOffset, 
        'right': cellWidth*4, 
        'down': cellHeight*4+imgOffset
    };
};


// ****************************************************
//  update method
// ****************************************************
Player.prototype.update = function() {


}

// ****************************************************
//  render method
// ****************************************************
Player.prototype.render = function() {
    ctx.font = "400 30px Gloria Hallelujah";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + score, 10, ctx.canvas.height-25);
    ctx.fillText("Level: " + level, 10,85);

    ctx.save();
    ctx.font = "400 80px Gloria Hallelujah";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(message, ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.restore();

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// ****************************************************
//  method to handle the input from the user
// ****************************************************
Player.prototype.handleInput = function(key) {

    this.keypressed = key;

    // Handle the key press and check if the location is at an edge first
    // before moving the coords.
    // Note: The below allows for the player to wrap around to the left 
    // or right, once the player reaches the right or left edge.
    switch (key) {
        case 'left':
            if (this.x < this.edge[key]) {
                this.x = this.edge['right'];
            } else {
                this.x -= 101;
            }
            break;
        case 'up':
            if (this.y > this.edge[key]) {
                this.y -= 83;
            }
            break;
        case 'right':
            if (this.x>= this.edge[key]) {
                this.x = 0;
            } else {
                this.x += 101;
            }
            break;
        case 'down':
            if (this.y < this.edge[key]) {
                this.y += 83;
            }
            break;
    }

    // check if the player has made it to the water, and
    // if so, send Won message, then reset
    if (this.y <= this.edge['up'] && state != 'won') {
        console.log('won');
        state = 'won';
        message = 'You Won!!!!!!';
        
        setTimeout(function(){
            // score grows by level amount;
            score += level;
            level += 1;
            topspeed += 10;
            console.log(topspeed);
            player.reset();
            allEnemies.forEach(function(enemy) {
                enemy.reset();
            });
            state = 'start';
            message = '';
        }, 3000);
    }
}

// ****************************************************
//  reset method
// ****************************************************
Player.prototype.reset = function() {
    this.x = cellWidth * 2;
    this.y = 5*cellHeight-imgOffset;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// var allEnemies = [new Enemy(100, 300, 250), new Enemy(300, 380, 150), new Enemy(400, 220, 350), new Enemy(-700, 130, 420)];
// var player = new Player(215, 460);

var topspeed = 180;
var score = 0;
var level = 1;
var imgOffset = 25;
var cellWidth = 101;
var cellHeight = 83;
var state = 'start';
var message = '';

var allEnemies = []; //creates an array of Enemies
(function displayEnemies() {
    'use strict';
    allEnemies.push(new Enemy(1));
    allEnemies.push(new Enemy(2));
    allEnemies.push(new Enemy(3));
}());


var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
