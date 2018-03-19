//
//============================================================
// Class: Enemy
//   enemies our player must avoid
//============================================================
//
var Enemy = function(row) {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    this.row = row;
    this.x = -cellWidth; // start off screen
    this.y = row*cellHeight - imgOffset; // find y based on the row
    
    // use a speed function so that we can increase speed for next level
    this.speed = this.getspeed(topspeed);

};

//
//**************************************************************
// Method: Enemy.speed
//
//  get random speed, based on top speed
//**************************************************************
//
Enemy.prototype.getspeed = function(top) {
    return Math.floor(Math.random() * top) + top - 5;
}

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
    if (this.x > ctx.canvas.width) {
        this.x = -cellWidth;
    }

    // Check for collision of each enemy with the player
    if(this.x >= player.x - imgOffset && this.x <= player.x + imgOffset) {
        if(this.y >= player.y - imgOffset && this.y <= player.y + imgOffset) {
            
            lives -= 1;

            if (lives) {
                if (level > 1) {
                    score -= level;
                    level -= 1;
                    topspeed -= 5;
                }

                message = "OUCH!!"
                setTimeout(function(){message = '';}, 1000);
            } else {
                message = "Game Over!!"
                player.renderLives();

                setTimeout(function(){
                    topspeed = 180;
                    score = 0;
                    level = 1;
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
    this.x = -cellWidth;
    this.speed = this.getspeed(topspeed);
};





//
//================================================
// Class: Player
//
//================================================
//
var Player = function() {
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


//
//****************************************************
// Method: Player.update
//****************************************************
//
Player.prototype.update = function() {
    //no-op
}

//
//****************************************************
// Method: Player.render
//****************************************************
//
Player.prototype.render = function() {

    // Text for the Score and Level headings
    ctx.font = "25pt Permanent Marker";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + score, 10, ctx.canvas.height-25);
    ctx.fillText("Level: " + level, 10,85);
 
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
    var xoff = 35;
    for (var i = 1; i <= lives; i++) {
        ctx.drawImage(Resources.get(this.sprite), ctx.canvas.width-xoff, 35, 30, 60);
        xoff += 40;
    }
}

//
// ****************************************************
//  Method: Player.handleInput
// ****************************************************
//
Player.prototype.handleInput = function(key) {

    this.keypressed = key;

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
                this.x = this.edge['right'];
            } else {
                this.x -= cellWidth;
            }
            break;
        case 'up':
            if (this.y > this.edge[key]) {
                this.y -= cellHeight;
            }
            break;
        case 'right':
            if (this.x>= this.edge[key]) {
                this.x = 0;
            } else {
                this.x += cellWidth;
            }
            break;
        case 'down':
            if (this.y < this.edge[key]) {
                this.y += cellHeight;
            }
            break;
    }

    // check if the player has made it to the water, and
    // if so, send Won message, then reset
    if (this.y <= this.edge['up'] && state != 'won') {
        state = 'won';
        message = 'Good Job!!';
        
        setTimeout(function(){
            // score grows by level amount;
            score += level;
            level += 1;
            // if not multiple of 5, just increase speed
            // else if multiple of 5 then add enemy
            if (level % 5) {
                topspeed += 5;
            } else {
                var row = allEnemies.length % 3 + 1;
                allEnemies.push(new Enemy(row));
            }
            player.reset();
            allEnemies.forEach(function(enemy) {
                enemy.reset();
            });
            state = 'start';
            message = '';
        }, 2000);
    }
}

//
// ****************************************************
//  Method: Player.reset
// ****************************************************
//
Player.prototype.reset = function() {
    this.x = cellWidth * 2;
    this.y = 5*cellHeight-imgOffset;
}

// Global varaibles
var topspeed = 180;
var score = 0;
var level = 1;
var imgOffset = 25;
var state = 'start';
var message = '';
var lives = 3;
// **  from engine.js
// width of column = 101
// height of row = 83
var cellWidth = 101;
var cellHeight = 83;


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(1), new Enemy(2), new Enemy(3)]; //creates an array of Enemies

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
