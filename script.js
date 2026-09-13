// Elementos da página
const telaMenu = document.getElementById('tela-menu');
const telaJogo = document.getElementById('tela-jogo');
const telaFim = document.getElementById('tela-fim');
const canvas = document.getElementById('canvas-jogo');
const ctx = canvas.getContext('2d');
const elementoPontuacao = document.getElementById('pontuacao');

// Configurações do jogo
const TAMANHO_BLOCO = 20;
const COLUNAS = 20;
const LINHAS = 20;
canvas.width = COLUNAS * TAMANHO_BLOCO;
canvas.height = LINHAS * TAMANHO_BLOCO;

const PONTOS_PARA_VENCER = 10;

let velocidadeJogo = 10;
let cobrinha = [];
let direcao = { x: 0, y: 0 };
let proximaDirecao = { x: 0, y: 0 };
let comida = { x: 0, y: 0 };
let pontuacao = 0;
let jogoRodando = false;
let intervaloJogo = null;

// Troca de telas
function mostrarTela(tela) {
    telaMenu.classList.add('escondido');
    telaJogo.classList.add('escondido');
    telaFim.classList.add('escondido');
    tela.classList.remove('escondido');
}

// Inicia o jogo com a velocidade escolhida
function iniciarJogo(velocidade) {
    velocidadeJogo = velocidade;
    cobrinha = [{ x: 10, y: 10 }];
    direcao = { x: 0, y: 0 };
    proximaDirecao = { x: 0, y: 0 };
    pontuacao = 0;
    gerarComida();

    mostrarTela(telaJogo);
    atualizarPontuacao();

    if (intervaloJogo) clearInterval(intervaloJogo);
    jogoRodando = true;
    intervaloJogo = setInterval(loopJogo, 1000 / velocidadeJogo);
}

function gerarComida() {
    comida.x = Math.floor(Math.random() * COLUNAS);
    comida.y = Math.floor(Math.random() * LINHAS);
}

function atualizarPontuacao() {
    elementoPontuacao.textContent = `Pontos: ${pontuacao}`;
}

function loopJogo() {
    direcao = proximaDirecao;

    if (direcao.x === 0 && direcao.y === 0) {
        desenharJogo();
        return;
    }

    const cabeca = {
        x: cobrinha[0].x + direcao.x,
        y: cobrinha[0].y + direcao.y
    };

    // Colisão com paredes
    if (cabeca.x < 0 || cabeca.x >= COLUNAS || cabeca.y < 0 || cabeca.y >= LINHAS) {
        finalizarJogo(false);
        return;
    }

    // Colisão com o próprio corpo
    for (const segmento of cobrinha) {
        if (segmento.x === cabeca.x && segmento.y === cabeca.y) {
            finalizarJogo(false);
            return;
        }
    }

    cobrinha.unshift(cabeca);

    // Verifica se comeu a comida
    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        pontuacao++;
        atualizarPontuacao();
        gerarComida();

        if (pontuacao >= PONTOS_PARA_VENCER) {
            finalizarJogo(true);
            return;
        }
    } else {
        cobrinha.pop();
    }

    desenharJogo();
}

function desenharJogo() {
    ctx.fillStyle = '#2a1740';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a comida (Jungkook)
    ctx.font = `${TAMANHO_BLOCO}px Arial`;
    ctx.fillText('🐰', comida.x * TAMANHO_BLOCO, comida.y * TAMANHO_BLOCO + TAMANHO_BLOCO);

    // Desenha a cobrinha-pintinho
    cobrinha.forEach((segmento, indice) => {
        const centroX = segmento.x * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;
        const centroY = segmento.y * TAMANHO_BLOCO + TAMANHO_BLOCO / 2;

        ctx.fillStyle = '#ffdd59';
        ctx.beginPath();
        ctx.arc(centroX, centroY, TAMANHO_BLOCO / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        if (indice === 0) {
            ctx.fillStyle = '#1e1e1e';
            ctx.beginPath();
            ctx.arc(centroX - 4, centroY - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centroX + 4, centroY - 3, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff8c00';
            ctx.beginPath();
            ctx.moveTo(centroX - 3, centroY + 2);
            ctx.lineTo(centroX + 3, centroY + 2);
            ctx.lineTo(centroX, centroY + 7);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function finalizarJogo(venceu) {
    jogoRodando = false;
    clearInterval(intervaloJogo);

    document.getElementById('imagem-resultado').src = venceu ? 'imagens/jikook_feliz.jpg' : 'imagens/jikook_triste.jpg';
    document.getElementById('titulo-resultado').textContent = venceu ? 'Você venceu! 💜' : 'Game Over 💜';
    document.getElementById('pontuacao-final').textContent = `Pontuação final: ${pontuacao}`;
    document.getElementById('mensagem-nacional').textContent = venceu ? 'Nacional sempre vence! 🐰💜' : 'Nacional forever!';

    mostrarTela(telaFim);
}

// Eventos: botões de nível
document.querySelectorAll('.botao-nivel').forEach(botao => {
    botao.addEventListener('click', () => {
        const velocidade = parseInt(botao.dataset.velocidade);
        iniciarJogo(velocidade);
    });
});

// Eventos: jogar de novo
document.getElementById('btn-jogar-novo').addEventListener('click', () => {
    mostrarTela(telaMenu);
});

// Eventos: teclado (PC)
document.addEventListener('keydown', (evento) => {
    if (!jogoRodando) return;

    if (evento.key === 'ArrowLeft' && direcao.x === 0) proximaDirecao = { x: -1, y: 0 };
    else if (evento.key === 'ArrowRight' && direcao.x === 0) proximaDirecao = { x: 1, y: 0 };
    else if (evento.key === 'ArrowUp' && direcao.y === 0) proximaDirecao = { x: 0, y: -1 };
    else if (evento.key === 'ArrowDown' && direcao.y === 0) proximaDirecao = { x: 0, y: 1 };
});

// Eventos: botões de toque (celular)
document.getElementById('btn-esquerda').addEventListener('click', () => {
    if (direcao.x === 0) proximaDirecao = { x: -1, y: 0 };
});
document.getElementById('btn-direita').addEventListener('click', () => {
    if (direcao.x === 0) proximaDirecao = { x: 1, y: 0 };
});
document.getElementById('btn-cima').addEventListener('click', () => {
    if (direcao.y === 0) proximaDirecao = { x: 0, y: -1 };
});
document.getElementById('btn-baixo').addEventListener('click', () => {
    if (direcao.y === 0) proximaDirecao = { x: 0, y: 1 };
});