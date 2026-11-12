// ===== VARIÁVEIS =====

// lista dos produtos do carrinho: { nome, preco, quantidade }
let carrinho = [];

// números dos cards do topo
let totalVendas = 48;
let faturamento = 4315.20;

// ===== PEGANDO OS ELEMENTOS DO HTML =====
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


// ===== FUNÇÕES =====

// transforma 249.8 em "R$ 249,80"
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// soma o preço x quantidade de cada item
function calcularTotal() {
  let total = 0;
  for (let i = 0; i < carrinho.length; i++) {
    total = total + carrinho[i].preco * carrinho[i].quantidade;
  }
  return total;
}

// desenha o carrinho na tela (chamo sempre que a lista muda)
function mostrarCarrinho() {
  listaCarrinho.innerHTML = "";

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = "<li class='item vazio'>Nenhum produto no carrinho.</li>";
  }

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

  totalCarrinho.textContent = formatarMoeda(calcularTotal());
}

// tira do carrinho o item que está na posição indicada
function removerItem(posicao) {
  carrinho.splice(posicao, 1);
  mostrarCarrinho();
}

// escreve os números nos 3 cards do topo
function atualizarResumo() {
  textoTotalVendas.textContent = totalVendas;
  textoFaturamento.textContent = formatarMoeda(faturamento);
  // ticket médio = faturamento dividido pelo número de vendas
  textoTicketMedio.textContent = formatarMoeda(faturamento / totalVendas);
}


// ===== EVENTOS =====

// 1) Adicionar ao carrinho
formVenda.addEventListener("submit", function (evento) {
  evento.preventDefault();   // impede a página de recarregar

  // o texto da opção é o nome e o value é o preço
  const nomeProduto = selectProduto.options[selectProduto.selectedIndex].text;
  const preco = Number(selectProduto.value);
  const quantidade = Number(inputQuantidade.value);

  if (quantidade < 1) {
    alert("Digite uma quantidade válida (mínimo 1).");
    return;
  }

  // se o produto já está no carrinho, só aumenta a quantidade
  let jaExiste = false;
  for (let i = 0; i < carrinho.length; i++) {
    if (carrinho[i].nome === nomeProduto) {
      carrinho[i].quantidade = carrinho[i].quantidade + quantidade;
      jaExiste = true;
    }
  }

  // se não estava, adiciona um item novo
  if (jaExiste === false) {
    carrinho.push({ nome: nomeProduto, preco: preco, quantidade: quantidade });
  }

  mostrarCarrinho();

  // deixa o formulário pronto para o próximo produto
  selectProduto.selectedIndex = 0;
  inputQuantidade.value = 1;
});


// 2) Finalizar venda
botaoFinalizar.addEventListener("click", function () {
  if (carrinho.length === 0) {
    alert("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  if (selectCliente.value === "") {
    alert("Escolha um cliente antes de finalizar.");
    return;
  }

  const cliente = selectCliente.value;
  const total = calcularTotal();

  // monta o texto dos produtos, ex: "2x Malbec + Egeo Dolce"
  let produtos = "";
  for (let i = 0; i < carrinho.length; i++) {
    if (i > 0) {
      produtos = produtos + " + ";
    }
    if (carrinho[i].quantidade > 1) {
      produtos = produtos + carrinho[i].quantidade + "x ";
    }
    produtos = produtos + carrinho[i].nome;
  }

  // insertRow(0) cria uma linha nova no topo da tabela
  const novaLinha = tabela.insertRow(0);
  novaLinha.innerHTML =
    "<td>" + new Date().toLocaleDateString("pt-BR") + "</td>" +
    "<td>" + cliente + "</td>" +
    "<td>" + produtos + "</td>" +
    "<td>" + formatarMoeda(total) + "</td>" +
    "<td><span class='badge'>Concluída</span></td>";

  // a tabela mostra só as 5 últimas vendas
  if (tabela.rows.length > 5) {
    tabela.deleteRow(tabela.rows.length - 1);
  }

  // atualiza os cards do topo
  totalVendas = totalVendas + 1;
  faturamento = faturamento + total;
  atualizarResumo();

  // limpa tudo para a próxima venda
  carrinho = [];
  mostrarCarrinho();
  formVenda.reset();

  alert("Venda registrada para " + cliente + "!");
});


// 3) Busca: a cada letra digitada, esconde as linhas que não combinam
campoBusca.addEventListener("input", function () {
  const termo = campoBusca.value.toLowerCase();

  for (let i = 0; i < tabela.rows.length; i++) {
    const texto = tabela.rows[i].textContent.toLowerCase();

    if (texto.includes(termo)) {
      tabela.rows[i].style.display = "";
    } else {
      tabela.rows[i].style.display = "none";
    }
  }
});


// 4) Botão "Nova venda": coloca o cursor no campo de cliente
botaoNovaVenda.addEventListener("click", function () {
  selectCliente.focus();
});


// ===== QUANDO A PÁGINA ABRE =====
mostrarCarrinho();
atualizarResumo();
