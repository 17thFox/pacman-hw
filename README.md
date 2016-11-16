# pacman-hw
Just a small PacMan homework

Given a map containing a labyrinth with walls ⛰, empty tiles, food tiles 🍒, two ghosts 👻 and a player 😺 (PacMan),
calculate the sequence of moves for the player character using the Minimax algorithm using the provided
scoring function.

On each turn first the player character moves and then the two ghosts move as well. The algorithm for
moving the ghosts is as follows: ghosts may select a random adjecent empty or food tile as long as it
is not the one they occupied the previous turn, with the exception when there is no other tile avaliable.

The starting score is 0 and it is required to display the moves and events that happen on each turn until
either the player eats all the food or one of the ghosts eat the player character. The output should be 
similar to the format:

```
Turn x:
 - player moves to [col,row] (score: x.yy)
 - player eats a piece of food, score is now y
 - ghost 1 moves to [col,row]
 - ghost 2 moves to [col,row]
 
Turn z:
 - player moves to [col,row] (score: x.yy)
 - player eats a piece of food, score is now y
 - ghost 1 moves to [col,row]
 - ghost 1 eats player character
 - ghosts win - GAME OVER

...
```

Labyrinth:
```
00000000000000000000
02222022222222022220
02002020000002020020
02022222222222222020
02020020011001002020
02222220311101222220
02020020000003002020
02022241111111222020
02002010000001020020
02222011111111022220
00000000000000000000
```

Tile types:
 * `0` - wall
 * `1` - empty tile
 * `2` - food
 * `3` - ghost starting position
 * `4` - player starting position

Minimax scoring function:
```
score = 1 * current_score 
        - 1.5 * distance_to(closest_food_tile)
        - 2 / distance_to(closest_ghost_position)
        - 4 * count(food_tiles)
```

You can use either Python or JavaScript (either server- or client-side) to implement the game.
Client-side JS is preferred since that would imply also using a bit of interactivity and user
interface design.

For extra credit:
 - use a depth larger than 1 for the Minimax algorithm (3 for example)
 - if writing client-side JS, implement a UI (use a `<table>` for example) for displaying 
   the current status of the game as well as a log for each turn; add a button to trigger
   the end of the turn; feel free to use any JS library like jQuery or Underscore.js;
   _a skeleton file will be provided for this_
   
*GL, HF!*
