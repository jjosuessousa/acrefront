const baseURL = "http://localhost/cine_tech_ac/public";

document.addEventListener("DOMContentLoaded", () => {
  carregarCategorias();
  listarFilmes();
});

function carregarCategorias() {
  fetch(`${baseURL}/categorias`)
    .then(res => res.json())
    .then(categorias => {
      const select = document.getElementById("categoria");
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });

      select.addEventListener("change", () => {
        if (select.value) {
          listarPorCategoria(select.value);
        } else {
          listarFilmes();
        }
      });
    })
    .catch(err => console.error("Erro ao carregar categorias:", err));
}

function listarFilmes() {
  fetch(`${baseURL}/listar-filme`)
    .then(res => res.json())
    .then(data => {
      console.log("Filmes recebidos:", data); // <-- Ajuda a debugar
      renderFilmes(data);
    })
    .catch(err => console.error("Erro ao listar filmes:", err));
}

function listarPorCategoria(categoria) {
  fetch(`${baseURL}/filmes/categoria/${categoria}`)
    .then(res => res.json())
    .then(renderFilmes)
    .catch(err => console.error("Erro ao filtrar filmes:", err));
}

function buscarFilmes() {
  const titulo = document.getElementById("pesquisa").value.trim();
  if (titulo === "") {
    listarFilmes();
    return;
  }

  fetch(`${baseURL}/filmes/buscar/${encodeURIComponent(titulo)}`)
    .then(res => res.json())
    .then(renderFilmes)
    .catch(err => console.error("Erro na busca:", err));
}

function renderFilmes(filmes) {
  const container = document.getElementById("filmesContainer");
  container.innerHTML = "";

  if (!Array.isArray(filmes) || filmes.length === 0) {
    container.innerHTML = "<p class='text-center'>Nenhum filme encontrado.</p>";
    return;
  }

  filmes.forEach(filme => {
    const card = document.createElement("div");
    card.className = "col-md-4";

    card.innerHTML = `
      <div class="card h-100">
        <img src="http://localhost/cine_tech_ac/uploads/${filme.capa}" class="card-img-top" alt="${filme.titulo}" />
        <div class="card-body">
          <h5 class="card-title">${filme.titulo}</h5>
          <p class="card-text">${filme.sinopse}</p>
          <p><strong>Categoria:</strong> ${filme.categoria}</p>
          <a href="${filme.trailer}" class="btn btn-outline-primary" target="_blank">Assistir Trailer</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
