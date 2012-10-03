window.onload = function() 
{
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d');
        WIDTH = canvas.width, 
        HEIGHT = canvas.height,
        SCORE_FOR_EATING_GOOD = 1000,
        SCORE_FOR_EATING_BAD_WHILE_INVINCIBLE = 100;
        
    var lastTime = Date.now(),
        timeDelta = 0,
        MAX_DELTA = 30;
        
    var enemies = {}, players = {};
    
    var me = {
        id: guid(),
        x: Math.floor(WIDTH/2),
        y: Math.floor(HEIGHT/2),
        size: 10,
        name: "Player",
        color: "#0000FF",
        invincible: 0,
        score: 0
    }
    
    //----------------------------------------------------------------------------------------------
    //Handle Server Messages
    // The URL of your web server (the port is set in app.js)
    var url = 'http://localhost:8080';
    var socket = io.connect(url);
    socket.on('update', function (data) {
        players[data.id] = data;
        players[data.id].ping = Date.now();
    });
    socket.on('createEnemey', function (data) {
        enemies[data.id] = data;
    });
    socket.on('removeEnemy', function (data) {
        delete enemies[data.id];
    });
    socket.on('death', function (data) {
        
    });
    //----------------------------------------------------------------------------------------------
    //Get user name and color
    function setNameAndColor()
    {
        me.name = $("#playerName").val();
        me.color = "#"+$("#playerColor").val();
        $("#playerSettings").fadeOut();
        gameLoop();
    }
    window.setNameAndColor = setNameAndColor;
    //----------------------------------------------------------------------------------------------
    function gameLoop() 
    {
        var time = Date.now();
        timeDelta = time - lastTime;
        lastTime = time;
        
        me.score += Math.floor(timeDelta / 10);
        if(me.score % 50 === 49) //Increase size every 50 points
        {
            me.size++;
        }
        handleEnemies();
        drawGame();
        removeIdlePlayers();
        requestAnimFrame(gameLoop, canvas);
    }
    function removeIdlePlayers() {
        for(var i in players)
        {
            //7 seconds with no update - remove 
            if(Date.now() - players[i].ping > 7000)
            {
                delete players[i];
            }
        }
    }
    function handleEnemies() 
    {
        for(var id in enemies) 
        {
            var enemy = enemies[id];
            enemy.x += (enemy.vX * timeDelta * 0.05);
            enemy.y += (enemy.vY * timeDelta * 0.05);
            if (enemy.y < 0 || enemy.y > HEIGHT || enemy.x < 0 || enemy.x > WIDTH)
                delete enemies[id];
            else
                checkEnemyCollisions(enemy);        
        }
    }
    function checkEnemyCollisions(enemy) 
    {
        if (!(enemy.x+10 > me.x-(me.size/2) && enemy.x < me.x+(me.size/2) 
            && enemy.y+10 > me.y-(me.size/2) && enemy.y < me.y+(me.size/2)))
        {
            return;
        }
        if (me.invincible)
        {
            me.size = Math.max(me.size - 1, 5);
            me.score += SCORE_FOR_EATING_BAD_WHILE_INVINCIBLE;
        }
        else if (enemy.good) 
        {
            me.score += SCORE_FOR_EATING_GOOD;
            me.invincible = 5;
            handleInvincible();
        }
        else 
        {
            iDied();
        }
        socket.emit("removeEnemy", { id: enemy.id });
        delete enemies[enemy.id];
    }
    function drawGame() 
    {
        ctx.clearRect(0,0,WIDTH,HEIGHT); //Redraw Background
        drawPlayer(me);
        for(var i in players)
        {
            drawPlayer(players[i]);
        }
        for(var j in enemies) 
        {
            ctx.fillStyle = (enemies[j].good) ? "lightGreen" : "black";
            ctx.fillRect(enemies[j].x, enemies[j].y, 10, 10); //Draw Enemy
        }
    }
    function drawPlayer(player) 
    {
        if(player.invincible > 0)
        {
            ctx.fillStyle = "red";
            ctx.fillRect(player.x-(player.size/2)-me.invincible, player.y-(player.size/2)-me.invincible, 
                         player.size+(me.invincible*2),player.size+(me.invincible*2));
        }
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x-(player.size/2), player.y-(player.size/2), player.size,player.size);
        ctx.font = '10px monospace';
        ctx.textBaseline = 'top';
        var info = player.name + " : " + player.score;
        ctx.fillText(info, player.x - (info.length * 3), player.y+(player.size/2));
    }
    function iDied() //DEATH!!!
    { 
        socket.emit("death", { name:me.name, score:me.score });
        //Reset
        me.score = 0;
        me.size = 10;
        me.invincible = 2;
        handleInvincible();
    }
    function handleInvincible() {
        me.invincible--;
        if(me.invincible <= 0)
        {
            return;
        }
        setTimeout(handleInvincible, 1000);
    }
    function guid() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    canvas.onmousemove = function (e) 
    {
        me.x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / parseInt(canvas.style.width)); 
        me.y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / parseInt(canvas.style.height)); 
        sendUpdate();
    };
    var lastUpdateTime = Date.now();
    function sendUpdate() {
        if(Date.now() - lastUpdateTime > 30)
        {
            socket.emit("update", me);
            lastUpdateTime = Date.now();
        }
    }
    setInterval(sendUpdate, 1000);
};
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };
})();