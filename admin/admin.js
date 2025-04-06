document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'http://localhost/cine_tech_ac/public';

  const form = document.getElementById('form-filme');
  const lista = document.getElementById('lista-filmes');
  const mensagem = document.getElementById('mensagem');
  const categoriaCheckboxContainer = document.getElementById('categorias-checkbox');
  const inputIdOuTitulo = document.getElementById('filmeId');

  // Gera o objeto FormData com os dados do formulário
  function montarFormData() {
    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value);
    formData.append('sinopse', document.getElementById('sinopse').value);
    formData.append('trailer', document.getElementById('trailer').value);
    formData.append('lancamento', document.getElementById('lancamento').value);
    formData.append('duracao', document.getElementById('duracao').value);

    // Coleta categorias marcadas
    const categoriasSelecionadas = Array.from(document.querySelectorAll('input[name="categorias[]"]:checked'))
      .map(cb => cb.value);

    formData.append('categorias', JSON.stringify(categoriasSelecionadas));

    const capa = document.getElementById('capa').files[0];
    if (capa) formData.append('capa', capa);

    return formData;
  }

  // Exibe mensagens com alertas do Bootstrap
  function mostrarMensagem(texto, tipo) {
    mensagem.innerHTML = `<div class="alert alert-${tipo} fade show">${texto}</div>`;
    setTimeout(() => { mensagem.innerHTML = ''; }, 4000);
  }

  // Cria os checkboxes fixos com as 5 categorias
  function carregarCategoriasFixas() {
    const categorias = ["Ação", "Terror", "Drama", "Ficção", "Romance"];
    categoriaCheckboxContainer.innerHTML = '';

    categorias.forEach(cat => {
      const checkbox = document.createElement('div');
      checkbox.className = 'form-check';
      checkbox.innerHTML = `
        <input class="form-check-input" type="checkbox" name="categorias[]" value="${cat}" id="cat-${cat}">
        <label class="form-check-label" for="cat-${cat}">${cat}</label>
      `;
      categoriaCheckboxContainer.appendChild(checkbox);
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

  // Busca um filme pelo ID ou título
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
          document.getElementById('lancamento').value = lancamento.toISOString().split('T')[0];
        }

        // Converte categorias
        let categoriasSelecionadas = [];
        if (Array.isArray(filme.categorias)) {
          categoriasSelecionadas = filme.categorias.map(cat => cat.nome || cat);
        } else if (typeof filme.categoria === 'string') {
          categoriasSelecionadas = filme.categoria.split(',').map(cat => cat.trim());
        }

        // Marca os checkboxes
        document.querySelectorAll('input[name="categorias[]"]').forEach(cb => {
          cb.checked = categoriasSelecionadas.includes(cb.value);
        });

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
    if (!id) return alert('Informe o ID do filme para atualizar.');

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
    if (!id) return alert('Informe o ID para deletar.');

    if (!confirm('Tem certeza que deseja deletar este filme?')) return;

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

  // Permite buscar apertando Enter no input do ID/título
  inputIdOuTitulo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarFilmeParaEditar();
    }
  });

  carregarCategoriasFixas();
  listarFilmes();
});
