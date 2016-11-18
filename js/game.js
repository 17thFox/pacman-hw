/* global $, Handlebars */
(function() {
  'use strict';
  var current_score = 0;
  const startState = `00000000000000000000
02222022222222022220
02002020000002020020
02022222222222222020
02020020011001002020
02222220311101222220
02020020000003002020
02022241111111222020
02002010000001020020
02222011111111022220
00000000000000000000`;

  const width = 20 + 1; // +1 de la endl
  const height = 11;

  const tileMapping = {
    '0': 'wall',
    '1': 'empty',
    '2': 'food',
    '3': 'ghost',
    '4': 'player'
  };

  let currentState = startState;

String.prototype.replaceAt = function(y, x, character) {
  let index = y * width + x;
  return this.substr(0, index) + character + this.substr(index + character.length);
}
String.prototype.getAt = function(y, x) {
  let index = y * width + x;
  return this[index];
}

  // Do stuff when the DOM is ready
  $(function() {
    // We use Handlebars.js for painless templating -- http://http://handlebarsjs.com/
    const $labyrinthRenderingTemplate = $('#labyrinthRenderingTemplate');
    const labyrinthTemplateFn = Handlebars.compile($labyrinthRenderingTemplate.html());

    // Bind some UI elements
    const $nextStepTrigger = $('#nextStepTrigger');
    const $gameStateContainer = $('#gameStateContainer');

    var turn = 0;
    var finished = 0;


    initGhostsAndPlayer();

    /**
     * This function renders the game state to the output DIV using a Handlebars template
     */
    function renderGameState(state) {
      const templateData = state.split('\n').map(function(row) {
        return row.split('').map(function(tile) {
          return tileMapping[tile];
        });
      });
      $gameStateContainer.empty().html(labyrinthTemplateFn(templateData));
    }

    /**
     * This function is used to calculate the next step
     */
    function calculateNextStep() {
      // Perform logic for step change
      //alert('Implement this please');

      // currentState = currentState.replaceAt(1, 2, "4");
      // renderGameState(currentState);
      if (finished != 0){
        finished = 0;
        currentState = (' ' + startState).slice(1);
        initGhostsAndPlayer();
        renderGameState(currentState);
        return;
      }
      turn += 1;
      print('Turn ' + turn);

      if(movePlayer()){
          moveGhost1();
          moveGhost2();
          renderGameState(currentState);
        }

    }

    // Bind some events from the UI
    $nextStepTrigger.on('click', calculateNextStep);

    // Render the game state once when we start
    renderGameState(currentState);

    function scoreAt(y, x, state) {
      return 1 * current_score -
        1.5 * distance_to('2') -
        2 / distance_to('3') -
        4 * count('2')
    }

    function getMax(y, x, depth, state) {
      var max = -999999999;
      if (y <= -1 || x <= -1 || y >= height || x >= width - 1) {
        return max;
      }

      if (viz[y][x] == 1) {
        return max;
      }

      viz[y][x] = 1;

      if (depth == 1) {
        initDist();
        distanceMatrix(y, x, 0);
        console.log('dist', dist)
        console.log('scoreAt', scoreAt(y, x, state))
        return scoreAt(y, x, state);
      }

      var n = getMax(y - 1, x, depth + 1);

      var v = getMax(y, x - 1, depth + 1);

      var e = getMax(y, x + 1, depth + 1);

      var s = getMax(y + 1, x, depth + 1);

      var maxX;
      var maxY;
      if (max < n) {
        max = n;
        maxX = x;
        maxY = y - 1;
      }
      if (max < v) {
        max = v;
        maxX = x - 1;
        maxY = y;
      }
      if (max < e) {
        max = e;
        maxX = x + 1;
        maxY = y;
      }
      if (max < s) {
        max = s;
        maxX = x;
        maxY = y + 1;
      }
      return {
        max: max,
        maxX: maxX,
        maxY: maxY
      };
    }

    var viz = {};
    var dist = {};

    function initViz() {

      for (var i = 0; i < height; i++) {
        viz[i] = {};
        for (var j = 0; j < width - 1; j++) {
          viz[i][j] = 0;
        }
      }

    }


    function initDist() {

      for (var i = 0; i < height; i++) {
        dist[i] = {};
        for (var j = 0; j < width - 1; j++) {
          dist[i][j] = 0;
        }
      }

    }

    function distanceMatrix(y, x, depth) {
      if (y <= -1 || x <= -1 || y >= height || x >= width - 1) {
        return;
      }

      if (currentState.getAt(y, x) == '0' || currentState.getAt(y, x) == '3') {
        dist[y][x] = 5555555555;
        return;
      }

      if (dist[y][x] != 0) {
        if (dist[y][x] > depth) {
            dist[y][x] = depth;
        }
        return;
      }

      dist[y][x] = depth;

      distanceMatrix(y + 1, x, depth + 1);
      distanceMatrix(y - 1, x, depth + 1);
      distanceMatrix(y, x + 1, depth + 1);
      distanceMatrix(y, x - 1, depth + 1);
    }

    function distance_to(tile) {
      var minState = 99999;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == tile && minState >= dist[i][j]) {
            minState = dist[i][j];
          }
        }
      }

      return minState;
    }

    function count(tile) {
      var sum = 0;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == tile) {
            sum += 1;
          }
        }
      }

      return sum;
    }

    var lastXGhost1, lastXGhost2, lastYGhost1, lastYGhost2, xGhost1, xGhost2, yGhost1, yGhost2, xPlayer, yPlayer, tileLastGhost1, tileLastGhost2;

    //Gaseste cele doua fantome din matrice si le salveaza pozitiile
    function initGhostsAndPlayer() {
        xGhost1 = undefined;
        turn = 0;
        current_score = 0;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == '3') {
            if (xGhost1 == undefined) {
              xGhost1 = j;
              yGhost1 = i;
            } else {
              xGhost2 = j;
              yGhost2 = i;
            }
          }
          if (currentState.getAt(i, j) == '4') {
            xPlayer = j;
            yPlayer = i;
          }
        }
      }
      lastXGhost1 = xGhost1;
      lastYGhost1 = yGhost1;
      lastXGhost2 = xGhost2;
      lastYGhost2 = yGhost2;
      tileLastGhost1 = '1';
      tileLastGhost2 = '1'; 
    }

    function getGhostNewPosition(y, x, lastYGhost, lastXGhost) {
      var pos = [];

      if (x - 1 > -1 && lastXGhost != x - 1) {
        if (currentState.getAt(y, x - 1) != '0') {
          pos.push({
            x: x - 1,
            y: y
          }); //v
        }
      }

      if (y - 1 > -1 && lastYGhost != y - 1) {
        if (currentState.getAt(y - 1, x) != '0') {
          pos.push({
            x: x,
            y: y - 1
          }); //n
        }
      }

      if (x + 1 < width - 1 && lastXGhost != x + 1) {
        if (currentState.getAt(y, x + 1) != '0') {
          pos.push({
            x: x + 1,
            y: y
          }); //e
        }
      }

      if (y + 1 < height && lastYGhost != y + 1) {
        if (currentState.getAt(y + 1, x) != '0') {
          pos.push({
            x: x,
            y: y + 1
          }); //s
        }
      }

      if (pos.length == 0) {
        return {
          x: lastXGhost,
          y: lastYGhost
        };
      }

      var rand = pos[Math.floor(Math.random() * pos.length)];
      return rand;

    }

    function movePlayer(){
        initViz();
        var newPos = getMax(yPlayer, xPlayer, 0, currentState);

        if( currentState.getAt(newPos['maxY'], newPos['maxX']) == '3'){
            print(" - Player moved on ghost.");
            print(" - Ghosts win - GAME OVER");
            finished = 1;
            return false;
        }

        print(" - Player moved to ["+newPos['maxX']+", "+ newPos['maxY']+"]. Score is: "+current_score);

        //current_score = newPos['max'];
        currentState = currentState.replaceAt(yPlayer, xPlayer, '1');
        if(currentState.getAt(newPos['maxY'], newPos['maxX']) == '2'){
            current_score += 1;
            print(" - Player eats a piece of food. Score is: "+current_score);
        }

        xPlayer = newPos['maxX'];
        yPlayer = newPos['maxY'];
        currentState = currentState.replaceAt(yPlayer, xPlayer, '4');
        return true;
    }


    function moveGhost1(){
        var newPos = getGhostNewPosition(yGhost1, xGhost1, lastYGhost1, lastXGhost1);
        currentState = currentState.replaceAt(yGhost1, xGhost1, tileLastGhost1);
        tileLastGhost1 = currentState.getAt(newPos['y'], newPos['x']);

        if(tileLastGhost1 == '4'){
            print(" - Ghost 1 eats player character");
            print(" - Ghosts win - GAME OVER");
            finished = 1;
            return;
        }

        print(" - Ghost 1 moved to ["+newPos['x']+", "+ newPos['y']+"]");
        if (tileLastGhost1 == '3'){
            tileLastGhost1 = tileLastGhost2;
        }

        lastXGhost1 = xGhost1;
        lastYGhost1 = yGhost1;
        yGhost1 = newPos['y'];
        xGhost1 = newPos['x'];
        currentState = currentState.replaceAt(yGhost1, xGhost1, '3');
    }


    function moveGhost2(){
        var newPos = getGhostNewPosition(yGhost2, xGhost2, lastYGhost2, lastXGhost2);
        currentState = currentState.replaceAt(yGhost2, xGhost2, tileLastGhost2);
        tileLastGhost2 = currentState.getAt(newPos['y'], newPos['x']);


        if(tileLastGhost2 == '4'){
            print(" - Ghost 2 eats player character");
            print(" - Ghosts win - GAME OVER");
            finished = 1;
            return;
        }

        print(" - Ghost 2 moved to ["+newPos['x']+", "+ newPos['y']+"]");
        if (tileLastGhost2 == '3'){
            tileLastGhost2 = tileLastGhost1;
        }

        lastXGhost2 = xGhost2;
        lastYGhost2 = yGhost2;
        yGhost2 = newPos['y'];
        xGhost2 = newPos['x'];
        currentState = currentState.replaceAt(yGhost2, xGhost2, '3');
    }


    function print(msg){
        var prev = $("#gameLogOutput").val();
        $("#gameLogOutput").val(prev + '\n' + msg);
    }

  });
})();