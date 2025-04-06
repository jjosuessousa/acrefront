document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'http://localhost/cine_tech_ac/public';

  const form = document.getElementById('form-filme');
  const lista = document.getElementById('lista-filmes');
  const mensagem = document.getElementById('mensagem');
  const categoriaSelect = document.getElementById('categoria');
  const inputIdOuTitulo = document.getElementById('filmeId');

  // Montar FormData
  function montarFormData() {
    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value);
    formData.append('sinopse', document.getElementById('sinopse').value);
    formData.append('trailer', document.getElementById('trailer').value);
    formData.append('lancamento', document.getElementById('lancamento').value);
    formData.append('duracao', document.getElementById('duracao').value);

    const categoriasSelecionadas = Array.from(categoriaSelect.selectedOptions).map(option => option.value);
    formData.append('categorias', JSON.stringify(categoriasSelecionadas));

    const capa = document.getElementById('capa').files[0];
    if (capa) formData.append('capa', capa);

    return formData;
  }
  function carregarCategorias() {
  fetch('http://localhost/cine_tech_ac/public/categorias')
    .then(response => response.json())
    .then(categorias => {
      const container = document.getElementById('categorias-checkbox');
      container.innerHTML = ''; // Limpa antes de adicionar

      categorias.forEach(cat => {
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check';

        checkbox.innerHTML = `
          <input class="form-check-input" type="checkbox" name="categorias[]" value="${cat.id}" id="cat-${cat.id}">
          <label class="form-check-label" for="cat-${cat.id}">${cat.nome}</label>
        `;

        container.appendChild(checkbox);
      });
    })
    .catch(error => console.error('Erro ao carregar categorias:', error));
}

// Chama ao carregar a página
window.addEventListener('DOMContentLoaded', carregarCategorias);


  // Mostrar mensagens
  function mostrarMensagem(texto, tipo) {
    mensagem.innerHTML = `<div class="alert alert-${tipo} fade show">${texto}</div>`;
    setTimeout(() => { mensagem.innerHTML = ''; }, 4000);
  }

  // Carregar categorias
  function carregarCategorias() {
    fetch(`${API_BASE}/categorias`)
      .then(res => res.json())
      .then(data => {
        categoriaSelect.innerHTML = '';
        data.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria.id; // Corrigido: envia o ID
          option.textContent = categoria.nome;
          categoriaSelect.appendChild(option);
        });
      });
  }
  

  // Listar filmes
  window.listarFilmes = function () {
    lista.innerHTML = '<li class="list-group-item">Carregando filmes...</li>';

    fetch(`${API_BASE}/listar-filme`)
      .then(res => res.json())
      .then(data => {
        lista.innerHTML = '';
        if (data.length === 0) {
          lista.innerHTML = '<li class="list-group-item">Nenhum filme cadastrado.</li>';
          return;
        }

        data.forEach(filme => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `
            <div class="d-flex align-items-start gap-3">
              <img src="${API_BASE.replace('/public', '')}/uploads/${filme.capa}" alt="Capa" width="100">
              <div>
                <h5>${filme.titulo}</h5>
                <p><strong>Categorias:</strong> ${filme.categoria}</p>
                <p>${filme.sinopse}</p>
                <a href="${filme.trailer}" target="_blank">Ver trailer</a>
              </div>
            </div>
          `;
          lista.appendChild(li);
        });
      });
  };

  // Buscar filme para edição
  window.buscarFilmeParaEditar = function () {
    const entrada = inputIdOuTitulo.value.trim();
    if (!entrada) return alert('Informe o ID ou o Título do filme');

    const url = isNaN(entrada)
      ? `${API_BASE}/filmes/buscar/${entrada}`
      : `${API_BASE}/filme/${entrada}`;

    fetch(url)
      .then(res => res.json())
      .then(resposta => {
        let filme;

        if (Array.isArray(resposta)) {
          if (resposta.length === 0) {
            mostrarMensagem('Nenhum filme encontrado.', 'warning');
            return;
          }
          filme = resposta[0];
        } else {
          filme = resposta;
        }

        document.getElementById('titulo').value = filme.titulo || '';
        document.getElementById('sinopse').value = filme.sinopse || '';
        document.getElementById('trailer').value = filme.trailer || '';
        document.getElementById('duracao').value = filme.duracao || '';
        inputIdOuTitulo.value = filme.id || '';

        const lancamento = filme.lancamento ? new Date(filme.lancamento) : null;
        if (lancamento instanceof Date && !isNaN(lancamento)) {
          const yyyyMMdd = lancamento.toISOString().split('T')[0];
          document.getElementById('lancamento').value = yyyyMMdd;
        } else {
          document.getElementById('lancamento').value = '';
        }

        let categoriasSelecionadas = [];

        if (Array.isArray(filme.categorias)) {
          categoriasSelecionadas = filme.categorias.map(cat => typeof cat === 'string' ? cat : cat.nome);
        } else if (typeof filme.categoria === 'string') {
          categoriasSelecionadas = filme.categoria.split(',').map(cat => cat.trim());
        }

        Array.from(categoriaSelect.options).forEach(option => {
          option.selected = categoriasSelecionadas.includes(option.value);
        });

        mostrarMensagem('Filme carregado para edição.', 'info');
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao buscar filme.', 'danger');
      });
  };

  // Atualizar filme
  window.atualizarFilme = function () {
    const id = inputIdOuTitulo.value;
    if (!id) return alert('Informe o ID do filme para atualizar.');

    const formData = montarFormData();

    fetch(`${API_BASE}/atualizar-filme/${id}`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem('Filme atualizado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao atualizar filme.', 'danger');
      });
  };

  // Deletar filme
  window.deletarFilme = function () {
    const id = inputIdOuTitulo.value;
    if (!id) return alert('Informe o ID para deletar.');

    if (!confirm('Tem certeza que deseja deletar este filme?')) return;

    fetch(`${API_BASE}/deletar-filme/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem('Filme deletado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao deletar filme.', 'danger');
      });
  };

  // Cadastrar filme
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) return mostrarMensagem('Título é obrigatório!', 'warning');

    const formData = montarFormData();

    fetch(`${API_BASE}/cadastrar-Filme`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        mostrarMensagem('Filme cadastrado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(error => {
        console.error(error);
        mostrarMensagem('Erro ao cadastrar filme', 'danger');
      });
  });

  // ENTER no campo de ID ou título
  inputIdOuTitulo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarFilmeParaEditar();
    }
  });

  // Inicializar
  carregarCategorias();
  listarFilmes();
});
