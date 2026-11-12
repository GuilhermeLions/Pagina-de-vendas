// ===== VARIÁVEIS GLOBAIS =====
// O carrinho é um Array vazio que vai guardar Objetos. Cada objeto terá {nome, preco, quantidade}.
let carrinho = [];

// Variáveis de estado para alimentar os cards superiores.
let totalVendas = 0;
let faturamento = 0;
let ticketMedio = 0;

// ===== MAPEAMENTO DO DOM =====
// Capturamos os elementos da tela uma única vez para não perder performance buscando toda hora.
const formVenda = document.querySelector("#form-venda");
const selectCliente = document.querySelector("#cliente");
const selectProduto = document.querySelector("#produto");
const inputQuantidade = document.querySelector("#quantidade");
const listaCarrinho = document.querySelector("#lista-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const botaoFinalizar = document.querySelector("#btn-finalizar");
const botaoNovaVenda = document.querySelector("#btn-nova-venda");
const campoBusca = document.querySelector("#busca");
const tabela = document.querySelector("#tabela-vendas");

const textoTotalVendas = document.querySelector("#total-vendas");
const textoFaturamento = document.querySelector("#faturamento");
const textoTicketMedio = document.querySelector("#ticket-medio");

// ===== FUNÇÕES DE LÓGICA E INTERFACE =====

// Função utilitária para converter números puros (ex: 10.5) no formato visual brasileiro (R$ 10,50)
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Varre o array do carrinho multiplicando o preço pela quantidade de cada item
function calcularTotal() {
  let total = 0;
  for (let i = 0; i < carrinho.length; i++) {
    total = carrinho[i].preco * carrinho[i].quantidade;
  }
  return total;
}

// Reconstrói a lista visual no HTML sempre que o array 'carrinho' sofre alteração (Adição ou Remoção)
function mostrarCarrinho() {
  listaCarrinho.innerHTML = ""; // Limpa a lista atual para não duplicar

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = "<li class='item vazio'>Nenhum produto no carrinho.</li>";
  }

  // Loop clássico para injetar o HTML concatenando as variáveis do objeto
  for (let i = 0; i < carrinho.length; i++) {
    const item = carrinho[i];
    const subtotal = item.preco * item.quantidade;

    listaCarrinho.innerHTML = listaCarrinho.innerHTML +
      "<li class='item'>" +
        "<span class='qtd'>" + item.quantidade + "x</span>" +
        "<span class='nome'>" + item.nome + "</span>" +
        "<span class='preco'>" + formatarMoeda(subtotal) + "</span>" +
        "<button class='btn-remover' onclick='removerItem(" + i + ")'>🗑️</button>" +
      "</li>";
  }

  // Atualiza o visor de total do carrinho
  totalCarrinho.textContent = formatarMoeda(calcularTotal());
}

// Remove 1 item do array com base no índice passado e manda redesenhar a tela
function removerItem(posicao) {
  carrinho.splice(posicao, 1);
  mostrarCarrinho();
}

// Atualiza a seção 'Resumo' calculando o Ticket Médio dinamicamente
function atualizarResumo() {
  textoTotalVendas.textContent = totalVendas;
  textoFaturamento.textContent = formatarMoeda(faturamento);
  textoTicketMedio.textContent = formatarMoeda(faturamento / totalVendas);
}

// ===== EVENTOS (INTERAÇÃO DO USUÁRIO) =====

// 1) Submit do formulário de vendas
formVenda.addEventListener("submit", function (evento) {
  evento.preventDefault(); // Trava o recarregamento padrão da página

  // Extrai os valores direto dos inputs/selects
  const nomeProduto = selectProduto.options[selectProduto.selectedIndex].text;
  const preco = Number(selectProduto.value);
  const quantidade = Number(inputQuantidade.value);

  if (quantidade < 1) {
    alert("Digite uma quantidade válida.");
    return;
  }

  // Verifica se o produto já existe no carrinho para somar a quantidade em vez de duplicar a linha
  let jaExiste = false;
  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].nome === nomeProduto) {
      carrinho[i].quantidade = carrinho[i].quantidade + quantidade;
      jaExiste = true;
    }
  }

  // Se o loop não encontrou o produto, damos um push criando um novo objeto no array
  if (jaExiste === false) {
    carrinho.push({ nome: nomeProduto, preco: preco, quantidade: quantidade });
  }

  mostrarCarrinho();

  // Reseta os campos para a próxima inserção
  selectProduto.selectedIndex = 0;
  inputQuantidade.value = 1;
});

// 2) Finalização da venda e atualização da tabela
botaoFinalizar.addEventListener("click", function () {
  if (carrinho.length === 0 || selectCliente.value === "") {
    alert("Preencha cliente e produtos.");
    return;
  }

  const cliente = selectCliente.value;
  const total = calcularTotal();

  // Monta a string concatenada com todos os produtos do carrinho para jogar na tabela
  let produtos = "";
  for (let i = 0; i < carrinho.length; i++) {
    if (i > 0) produtos = produtos + " + ";
    if (carrinho[i].quantidade > 1) produtos = produtos + carrinho[i].quantidade + "x ";
    produtos = produtos + carrinho[i].nome;
  }

  // Injeta uma nova linha <tr> no topo da tabela HTML dinamicamente
  const novaLinha = tabela.insertRow(0);
  novaLinha.innerHTML =
    "<td>" + new Date().toLocaleDateString("pt-BR") + "</td>" +
    "<td>" + cliente + "</td>" +
    "<td>" + produtos + "</td>" +
    "<td>" + formatarMoeda(total) + "</td>" +
    "<td><span class='badge'>Concluída</span></td>";

  // Mantém apenas as últimas 5 vendas (se passar de 5, deleta a última linha)
  if (tabela.rows.length > 5) {
    tabela.deleteRow(tabela.rows.length - 1);
  }

  // Incrementa as variáveis globais e redesenha os cards
  totalVendas = totalVendas + 1;
  faturamento = faturamento + total;
  atualizarResumo();

  // Limpeza de estado pós-venda
  carrinho = [];
  mostrarCarrinho();
  formVenda.reset();
  alert("Venda registrada com sucesso!");
});

// 3) Filtro em tempo real (Busca)
campoBusca.addEventListener("input", function () {
  const termo = campoBusca.value.toLowerCase();

  // Varre todas as linhas da tabela; se o texto da linha não incluir o termo, aplicamos display: none
  for (let i = 0; i < tabela.rows.length; i++) {
    const texto = tabela.rows[i].textContent.toLowerCase();
    if (texto.includes(termo)) {
      tabela.rows[i].style.display = "";
    } else {
      tabela.rows[i].style.display = "none";
    }
  }
});

// 4) Foco no input
botaoNovaVenda.addEventListener("click", function () {
  selectCliente.focus();
});

// Inicialização das funções quando a página carrega
mostrarCarrinho();
atualizarResumo();
