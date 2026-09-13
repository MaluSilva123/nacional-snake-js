// Elementos da página
const telaInicio = document.getElementById('tela-inicio');
const telaMenu = document.getElementById('tela-menu');
const telaJogo = document.getElementById('tela-jogo');
const telaFim = document.getElementById('tela-fim');
const canvas = document.getElementById('canvas-jogo');
const ctx = canvas.getContext('2d');
const elementoPontuacao = document.getElementById('pontuacao');
const listaNiveis = document.getElementById('lista-niveis');

// Configurações do jogo
const TAMANHO_BLOCO = 20;
const COLUNAS = 20;
const LINHAS = 20;
canvas.width = COLUNAS * TAMANHO_BLOCO;
canvas.height = LINHAS * TAMANHO_BLOCO;

// Estrelinhas fixas do fundo (geradas uma única vez)
const estrelasFixas = Array.from({ length: 25 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * 130
}));

// Definição dos níveis: cada um tem um nome, velocidade e pontuação mínima pra desbloquear
const NIVEIS = [
    { nome: 'Fácil', velocidade: 6, requisito: 0 },
    { nome: 'Médio', velocidade: 10, requisito: 5 },
    { nome: 'Difícil', velocidade: 15, requisito: 15 }
];

let velocidadeJogo = 6;
let cobrinha = [];
let direcao = { x: 0, y: 0 };
let proximaDirecao = { x: 0, y: 0 };
let comida = { x: 0, y: 0 };
let pontuacao = 0;
let jogoRodando = false;
let intervaloJogo = null;

// ---- Recorde salvo no navegador ----
function obterRecorde() {
    return parseInt(localStorage.getItem('nacionalSnakeRecorde')) || 0;
}

function salvarRecorde(valor) {
    localStorage.setItem('nacionalSnakeRecorde', valor);
}

// ---- Troca de telas ----
function mostrarTela(tela) {
    telaInicio.classList.add('escondido');
    telaMenu.classList.add('escondido');
    telaJogo.classList.add('escondido');
    telaFim.classList.add('escondido');
    tela.classList.remove('escondido');
}

// ---- Monta os botões de nível dinamicamente, com base no recorde atual ----
function montarListaNiveis() {
    const recorde = obterRecorde();
    listaNiveis.innerHTML = '';

    NIVEIS.forEach(nivel => {
        const botao = document.createElement('button');
        botao.classList.add('botao-nivel');

        const desbloqueado = recorde >= nivel.requisito;

        if (desbloqueado) {
            botao.textContent = nivel.nome;
            botao.addEventListener('click', () => iniciarJogo(nivel.velocidade));
        } else {
            botao.textContent = `🔒 ${nivel.nome} (${nivel.requisito} pts)`;
            botao.classList.add('trancado');
            botao.disabled = true;
        }

        listaNiveis.appendChild(botao);
    });
}

function atualizarTextosRecorde() {
    const recorde = obterRecorde();
    document.getElementById('recorde-inicio').textContent = `Recorde: ${recorde}`;
    document.getElementById('recorde-menu').textContent = `Recorde: ${recorde}`;
}

// ---- Início do jogo ----
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
        finalizarJogo();
        return;
    }

    // Colisão com o próprio corpo
    for (const segmento of cobrinha) {
        if (segmento.x === cabeca.x && segmento.y === cabeca.y) {
            finalizarJogo();
            return;
        }
    }

    cobrinha.unshift(cabeca);

    // Verifica se comeu a comida (sem limite de pontos!)
    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        pontuacao++;
        atualizarPontuacao();
        gerarComida();
    } else {
        cobrinha.pop();
    }

    desenharJogo();
}

// ---- Fundo temático (roxo mágico, castelo, lanternas, estrelas) ----
function desenharFundoTematico() {
    const gradiente = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradiente.addColorStop(0, '#78329a');
    gradiente.addColorStop(1, '#1e0f2d');
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(120, 70, 150, 0.25)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= canvas.width; gx += TAMANHO_BLOCO) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
        ctx.stroke();
    }
    for (let gy = 0; gy <= canvas.height; gy += TAMANHO_BLOCO) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
        ctx.stroke();
    }

    const meio = canvas.width / 2;

    const brilho = ctx.createRadialGradient(meio, 70, 5, meio, 70, 55);
    brilho.addColorStop(0, 'rgba(255, 200, 120, 0.35)');
    brilho.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = brilho;
    ctx.fillRect(meio - 60, 15, 120, 120);

    ctx.fillStyle = '#140a23';
    ctx.beginPath();
    ctx.moveTo(meio - 70, 120);
    ctx.lineTo(meio - 70, 75);
    ctx.lineTo(meio - 55, 75);
    ctx.lineTo(meio - 55, 52);
    ctx.lineTo(meio - 40, 52);
    ctx.lineTo(meio - 40, 36);
    ctx.lineTo(meio - 25, 36);
    ctx.lineTo(meio - 25, 60);
    ctx.lineTo(meio, 16);
    ctx.lineTo(meio + 25, 60);
    ctx.lineTo(meio + 25, 36);
    ctx.lineTo(meio + 40, 36);
    ctx.lineTo(meio + 40, 52);
    ctx.lineTo(meio + 55, 52);
    ctx.lineTo(meio + 55, 75);
    ctx.lineTo(meio + 70, 75);
    ctx.lineTo(meio + 70, 120);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffbe5a';
    for (let lx = 15; lx < canvas.width - 15; lx += 40) {
        ctx.beginPath();
        ctx.arc(lx, 140, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#785828';
        ctx.beginPath();
        ctx.moveTo(lx, 140);
        ctx.lineTo(lx, 134);
        ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    estrelasFixas.forEach(estrela => {
        ctx.beginPath();
        ctx.arc(estrela.x, estrela.y, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

function desenharJogo() {
    desenharFundoTematico();

    ctx.font = `${TAMANHO_BLOCO}px Arial`;
    ctx.fillText('🐰', comida.x * TAMANHO_BLOCO, comida.y * TAMANHO_BLOCO + TAMANHO_BLOCO);

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

// ---- Fim de jogo: sempre por colisão, sem limite de pontos ----
function finalizarJogo() {
    jogoRodando = false;
    clearInterval(intervaloJogo);

    const recordeAnterior = obterRecorde();
    const bateuRecorde = pontuacao > recordeAnterior;

    if (bateuRecorde) {
        salvarRecorde(pontuacao);
    }

    document.getElementById('imagem-resultado').src = bateuRecorde ? 'imagens/jikook_feliz.jpg' : 'imagens/jikook_triste.jpg';
    document.getElementById('titulo-resultado').textContent = bateuRecorde ? 'Você venceu! 💜' : 'Game Over 💜';
    document.getElementById('pontuacao-final').textContent = `Pontuação final: ${pontuacao}`;

    const mensagemRecorde = document.getElementById('mensagem-recorde');
    if (bateuRecorde) {
        mensagemRecorde.textContent = '🏆 Novo recorde!';
    } else {
        mensagemRecorde.textContent = `Recorde atual: ${recordeAnterior}`;
    }

    document.getElementById('mensagem-nacional').textContent = bateuRecorde ? 'Nacional sempre vence! 🐰💜' : 'Nacional forever!';

    atualizarTextosRecorde();
    mostrarTela(telaFim);
}

// ---- Eventos ----
document.getElementById('btn-jogar').addEventListener('click', () => {
    montarListaNiveis();
    atualizarTextosRecorde();
    mostrarTela(telaMenu);
});

document.getElementById('btn-jogar-novo').addEventListener('click', () => {
    montarListaNiveis();
    atualizarTextosRecorde();
    mostrarTela(telaMenu);
});

document.addEventListener('keydown', (evento) => {
    if (!jogoRodando) return;

    if (evento.key === 'ArrowLeft' && direcao.x === 0) proximaDirecao = { x: -1, y: 0 };
    else if (evento.key === 'ArrowRight' && direcao.x === 0) proximaDirecao = { x: 1, y: 0 };
    else if (evento.key === 'ArrowUp' && direcao.y === 0) proximaDirecao = { x: 0, y: -1 };
    else if (evento.key === 'ArrowDown' && direcao.y === 0) proximaDirecao = { x: 0, y: 1 };
});

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

// Inicializa os textos de recorde assim que a página carrega
atualizarTextosRecorde();