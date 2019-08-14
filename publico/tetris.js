
const socket = io();

const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");

const cvsA1 = document.getElementById("adelanto1");
const ctxA1 = cvsA1.getContext("2d");

const cvsA2 = document.getElementById("adelanto2");
const ctxA2 = cvsA2.getContext("2d");

const cvsA3 = document.getElementById("adelanto3");
const ctxA3 = cvsA3.getContext("2d");

const cvsG = document.getElementById("guardado");
const ctxG = cvsG.getContext("2d");

const contextos = [ctxA1,ctxA2,ctxA3];

const scoreElement = document.getElementById("score");

const FILAS = 20;
const COL = COLUMNAS = 10;
const SQ = squareSize = 20;
const NADA = "WHITE"; // color of an empty square
const GHOST = "GRAY";

socket.on('bajar',() => {
    p.moverAbajoL();
});

// the PIEZAS and their colors

const PIEZAS = [
    [Z,"red"],
    [S,"green"],
    [T,"#804000"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

let adelantos = [];
for(i = 0;i < 3; i++){
    adelantos[i] = nRandom = Math.floor(Math.random() * 6);
}




// draw a square
function drawSquare(x,y,color,contexto){
    contexto.fillStyle = color;
    contexto.fillRect(x*SQ,y*SQ,SQ,SQ);

    contexto.strokeStyle = "BLACK";
    contexto.strokeRect(x*SQ,y*SQ,SQ,SQ);
}
function drawBlanco(x,y,color,contexto){
    contexto.fillStyle = color;
    contexto.fillRect(x*SQ,y*SQ,SQ,SQ);
}

// create the board

let board = [];
for( r = 0; r <FILAS; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = NADA;
    }
}

// draw the board
function drawBoard(){
    for( r = 0; r <FILAS; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c],ctx);
        }
    }
}

drawBoard();

// generate random PIEZAS

function nuevaPieza(condicion){
    if(condicion){
        let a = adelantos[0]
        
        adelantos[0] = adelantos [1];
        adelantos[1] = adelantos [2];
        adelantos[2] = nRandom = Math.floor(Math.random() * PIEZAS.length);
        for(i = 0;i < 3; i++){
            borrarCanvas(contextos[i]);
            dibujarAdelanto(adelantos[i],contextos[i]);
        }
        
        return new Pieza( PIEZAS[a][0],PIEZAS[a][1]);
        
    }
    else{

        return new Pieza(fichaGuardada[0],fichaGuardada[1]);
        
    }

}

let p = nuevaPieza(true);
let g = new Pieza (p.tetromino,GHOST);



// The Object Pieza

function Pieza(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // we need to control the PIEZAS
    this.x = 3;
    this.y = -2;
}


// codigo de el nitro

let fichaGuardada = [];
let guardar = true;
Pieza.prototype.guardarFicha = function(){
    if(fichaGuardada == 0){
        if(guardar){
            fichaGuardada[0] = this.tetromino;
            fichaGuardada[1] = this.color;
            dibujarGuardado(fichaGuardada[0],fichaGuardada[1],ctxG);
            p.desDibujar();
            p = nuevaPieza(true);
            
            guardar = false;
        }
    }
    else{
        if(guardar){
            let tetro = this.tetromino;
            let colo = this.color;
            p.desDibujar();
            p = nuevaPieza(false);
            fichaGuardada[0] = tetro;
            fichaGuardada[1] = colo;
            borrarCanvas(ctxG);
            dibujarGuardado(fichaGuardada[0],fichaGuardada[1],ctxG);
            guardar = false;
        }
    } 
}



function dibujarGuardado (guardado,color,contexto){
    let b = guardado[0];
    for( r = 0; r < b.length; r++){
        for(c = 0; c < b.length; c++){
            if( b[r][c]){
                drawSquare(c,r,color,contexto);
            }
        }
    }
}
function dibujarAdelanto (adelanto,contexto){
    let a = PIEZAS[adelanto][0];
    let b = a[0];
    for( r = 0; r < b.length; r++){
        for(c = 0; c < b.length; c++){
            if( b[r][c]){
                drawSquare(c,r,PIEZAS[adelanto][1],contexto);
            }
        }
    }
}
function borrarCanvas(contexto){
    for( r = 0; r < 4; r++){
        for(c = 0; c < 4; c++){
            drawBlanco(c,r,NADA,contexto);
        }
    }
}

Pieza.prototype.dibujarFantasma = function(){

    this.desDibujar();
    this.y = -10;
    this.x = p.x;
    this.activeTetromino = p.activeTetromino;
    this.moverFullAbajo();
}



//fin de el codigo de el nitro

// fill function

Pieza.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw only occupied squares
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color,ctx);
            }
        }
    }
}

// draw a Pieza to the board

Pieza.prototype.draw = function(){
    this.fill(this.color);
}

// desDibujar a Pieza


Pieza.prototype.desDibujar = function(){
    this.fill(NADA);
}

// move Down the Pieza

Pieza.prototype.moverAbajoL = function(){
    if(!this.colision(0,1,this.activeTetromino)){
        this.desDibujar();
        this.y++;
        g.dibujarFantasma();
        this.draw();

    }else{
        // we lock the Pieza and generate a new one
        this.lock();
        p = nuevaPieza(true);
        g.y=-10;
    }
    
}
Pieza.prototype.moverAbajo = function(){
    if(!this.colision(0,1,this.activeTetromino)){
        this.desDibujar();
        this.y++;
        g.dibujarFantasma();
        this.draw();

    }
}

Pieza.prototype.moverFullAbajo = function(){
    
    this.desDibujar();
    while(!this.colision(0,1,this.activeTetromino)){        
        this.y++;
    }
    this.draw();
    if(this.color!=GHOST){
        this.lock();
        p = nuevaPieza(true);
        g.y=-10;
    }


}

// move Right the Pieza
Pieza.prototype.moverDerecha = function(){
    if(!this.colision(1,0,this.activeTetromino)){
        this.desDibujar();
        this.x++;
        g.dibujarFantasma();
        this.draw();

    }
}

// move Left the Pieza
Pieza.prototype.moverIzquierda = function(){
    if(!this.colision(-1,0,this.activeTetromino)){
        this.desDibujar();
        this.x--;
        g.dibujarFantasma();
        this.draw();


    }
}

// rotar the Pieza
Pieza.prototype.rotar = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let contacto = 0;
    
    if(this.colision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            contacto = -1; // we need to move the Pieza to the left
        }else{
            // it's the left wall
            contacto = 1; // we need to move the Pieza to the right
        }
    }
    
    if(!this.colision(contacto,0,nextPattern)){
        this.desDibujar();
        this.x += contacto;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
        g.dibujarFantasma();
    }
}

let score = 0;

Pieza.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the NADA squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // PIEZAS to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the Pieza
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full FILASs
    for(r = 0; r < FILAS; r++){
        let isFILASFull = true;
        for( c = 0; c < COL; c++){
            isFILASFull = isFILASFull && (board[r][c] != NADA);
        }
        if(isFILASFull){
            // if the FILAS is full
            // we move down all the FILASs above it
            socket.emit('linea');
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top FILAS board[0][..] has no FILAS above it
            for( c = 0; c < COL; c++){
                board[0][c] = NADA;
            }
            // increment the score
            score += 10;
        }
    }

    guardar = true;
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}

// colision fucntion

Pieza.prototype.colision = function(x,y,Pieza){
    for( r = 0; r < Pieza.length; r++){
        for(c = 0; c < Pieza.length; c++){
            // if the square is empty, we skip it
            if(!Pieza[r][c]){
                continue;
            }
            // coordinates of the Pieza after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= COL || newY >= FILAS){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked Pieza alrady in place
            if( board[newY][newX] != NADA && board[newY][newX] != GHOST){
                return true;
            }
        }
    }
    return false;
}

// CONTROL the Pieza

document.addEventListener("keydown",CONTROL);


function CONTROL(event){
    if(event.keyCode == 37){
        p.moverIzquierda();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotar();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moverDerecha();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moverAbajo();
    }else if(event.keyCode == 67){
        p.guardarFicha();
    }else if(event.keyCode == 32){
        p.moverFullAbajo();
    }else if(event.keyCode == 85){
        drawBoard();
    }
}

// drop the Pieza every 1sec


let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 200){
        p.moverAbajoL();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();     



















