document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'http://localhost/cine_tech_ac/public';

  const form = document.getElementById('form-filme');
  const lista = document.getElementById('lista-filmes');
  const mensagem = document.getElementById('mensagem');
  const categoriaSelect = document.getElementById('categoria'); // Seleção única para categoria
  const inputIdOuTitulo = document.getElementById('filmeId'); // Campo para buscar filme

  // Gera o objeto FormData com os dados do formulário
  function montarFormData() {
    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value);
    formData.append('sinopse', document.getElementById('sinopse').value);
    formData.append('trailer', document.getElementById('trailer').value);
    formData.append('lancamento', document.getElementById('lancamento').value);
    formData.append('duracao', document.getElementById('duracao').value);

    // Coleta categoria selecionada
    const categoriaSelecionada = categoriaSelect.value;
    formData.append('categoria', categoriaSelecionada);

    const capa = document.getElementById('capa').files[0];
    if (capa) formData.append('capa', capa);

    return formData;
  }

  // Exibe mensagens com alertas do Bootstrap
  function mostrarMensagem(texto, tipo) {
    mensagem.innerHTML = `<div class="alert alert-${tipo} fade show">${texto}</div>`;
    setTimeout(() => { mensagem.innerHTML = ''; }, 4000);
  }

  // Carregar categorias fixas
  function carregarCategoriasFixas() {
    const categorias = ["Ação", "Terror", "Drama", "Romance"];
    categoriaSelect.innerHTML = '';

    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoriaSelect.appendChild(option);
    });
  }

  // Lista todos os filmes cadastrados
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
                <p><strong>Categoria:</strong> ${filme.categoria}</p>
                <p>${filme.sinopse}</p>
                <a href="${filme.trailer}" target="_blank">Ver trailer</a>
              </div>
            </div>
          `;
          lista.appendChild(li);
        });
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao carregar filmes.', 'danger');
      });
  };

  // Busca um filme pelo ID ou título para edição
  window.buscarFilmeParaEditar = function () {
    const entrada = inputIdOuTitulo.value.trim();
    if (!entrada) return mostrarMensagem('Informe o ID ou o Título do filme.', 'warning');

    const url = isNaN(entrada)
      ? `${API_BASE}/filmes/buscar/${entrada}`
      : `${API_BASE}/filme/${entrada}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const filme = Array.isArray(data) ? data[0] : data;

        if (!filme) {
          mostrarMensagem('Filme não encontrado.', 'warning');
          return;
        }

        // Preencher o formulário com os dados do filme
        document.getElementById('titulo').value = filme.titulo || '';
        document.getElementById('sinopse').value = filme.sinopse || '';
        document.getElementById('trailer').value = filme.trailer || '';
        document.getElementById('duracao').value = filme.duracao || '';
        categoriaSelect.value = filme.categoria || '';
        inputIdOuTitulo.value = filme.id || '';
        
        const lancamento = filme.lancamento ? new Date(filme.lancamento) : null;
        if (lancamento instanceof Date && !isNaN(lancamento)) {
          document.getElementById('lancamento').value = lancamento.toISOString().split('T')[0];
        }

        mostrarMensagem('Filme carregado para edição.', 'info');
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao buscar filme.', 'danger');
      });
  };

  // Atualiza os dados do filme
  window.atualizarFilme = function () {
    const id = inputIdOuTitulo.value;
    if (!id) return mostrarMensagem('Informe o ID do filme para atualizar.', 'warning');

    const formData = montarFormData();

    fetch(`${API_BASE}/atualizar-filme/${id}`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        mostrarMensagem('Filme atualizado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao atualizar filme.', 'danger');
      });
  };

  // Exclui um filme
  window.deletarFilme = function () {
    const id = inputIdOuTitulo.value;
    if (!id) return mostrarMensagem('Informe o ID do filme para deletar.', 'warning');

    if (!confirm('Tem certeza que deseja excluir este filme?')) return;

    fetch(`${API_BASE}/deletar-filme/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        mostrarMensagem('Filme deletado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao deletar filme.', 'danger');
      });
  };

  // Envia o formulário para cadastrar um novo filme
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) return mostrarMensagem('Título é obrigatório!', 'warning');

    const formData = montarFormData();

    fetch(`${API_BASE}/cadastrar-Filme`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        mostrarMensagem('Filme cadastrado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      })
      .catch(err => {
        console.error(err);
        mostrarMensagem('Erro ao cadastrar filme.', 'danger');
      });
  });

  // Inicializa a aplicação
  carregarCategoriasFixas();
  listarFilmes();
});