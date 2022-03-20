# QulturePS

A simple web implementation of checkers, with the rules found on Wikipedia.

# Design choiches

For the Design Pattern, Factory functions and Module Pattern with prototypal inheritance having Functional Programming's style in mind.

Inside each factory are methods which are used to coordenate the gameflow between DOM, the board and players.

Since there were wasn't a definite size for the board, it became a variable in the game.js file, so both 8x8 and 10x10 versions can be played by just changing the value on the code.

# How to play

Above the board is a message board highlighting whose turn it is and who won at the end.

After selecting a piece to move, the avaiable moves for that piece will be highlighted in green and it's necessary to click inside the green circle, otherwise it won't register, because the eventListener is added to the circle created and not the square.

Regarding the need to take a piece when possible, it isn't imposed, but, after taking, it has to keep taking until it can't or is promoted, since promotion passes the turn.

# Where to play

Live version:
https://sandersohngen.github.io/QulturePS/