document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-filme');
  const lista = document.getElementById('lista-filmes');
  const mensagem = document.getElementById('mensagem');
  const categoriaSelect = document.getElementById('categoria');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

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

    fetch('http://localhost/cine_tech_ac/public/cadastrar-Filme', {
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

  window.listarFilmes = function () {
    fetch('http://localhost/cine_tech_ac/public/listar-filme')
      .then(res => res.json())
      .then(data => {
        lista.innerHTML = '';
        data.forEach(filme => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `
            <div class="d-flex align-items-start gap-3">
              <img src="http://localhost/cine_tech_ac/uploads/${filme.capa}" alt="Capa" width="100">
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

  window.buscarFilmeParaEditar = function () {
    const entrada = document.getElementById('filmeId').value.trim();
    if (!entrada) return alert('Informe o ID ou o Título do filme');
  
    const url = isNaN(entrada)
      ? `http://localhost/cine_tech_ac/public/filmes/buscar/${entrada}`
      : `http://localhost/cine_tech_ac/public/filme/${entrada}`;
  
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
        document.getElementById('filmeId').value = filme.id || '';

        const lancamento = filme.lancamento ? new Date(filme.lancamento) : null;
        if (lancamento instanceof Date && !isNaN(lancamento)) {
          const yyyyMMdd = lancamento.toISOString().split('T')[0];
          document.getElementById('lancamento').value = yyyyMMdd;
        } else {
          document.getElementById('lancamento').value = '';
        }

        // NOVO: suporte a diferentes formatos de categorias
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

  window.atualizarFilme = function () {
    const id = document.getElementById('filmeId').value;
    if (!id) return alert('Informe o ID do filme para atualizar.');

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

    fetch(`http://localhost/cine_tech_ac/public/atualizar-filme/${id}`, {
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

  window.deletarFilme = function () {
    const id = document.getElementById('filmeId').value;
    if (!id) return alert('Informe o ID para deletar.');

    fetch(`http://localhost/cine_tech_ac/public/deletar-filme/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem('Filme deletado com sucesso!', 'success');
        form.reset();
        listarFilmes();
      });
  };

  function mostrarMensagem(texto, tipo) {
    mensagem.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    setTimeout(() => { mensagem.innerHTML = ''; }, 4000);
  }

  function carregarCategorias() {
    fetch('http://localhost/cine_tech_ac/public/categorias')
      .then(res => res.json())
      .then(data => {
        categoriaSelect.innerHTML = '';
        data.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.nome;
          option.textContent = cat.nome;
          categoriaSelect.appendChild(option);
        });
      });
  }

  carregarCategorias();
  listarFilmes();
});
