# Comparativo Giannini — versão web

Página interativa de comparação de produtos (Giannini x concorrentes), pensada para
representantes acessarem pelo celular ou notebook em campo, sem precisar abrir o Excel.

## Arquivos

- `index.html` — estrutura da página
- `style.css` — visual (paleta, tipografia)
- `script.js` — toda a lógica de seleção e comparação
- `data.json` — os dados dos produtos (é o único arquivo que muda quando vocês atualizam o catálogo)

## Como publicar no GitHub Pages (gratuito)

1. Crie um repositório novo no GitHub (pode ser privado ou público — Pages funciona nos dois,
   mas em repositório privado o Pages exige plano GitHub Pro/Team/Enterprise).
2. Suba estes 4 arquivos (`index.html`, `style.css`, `script.js`, `data.json`) na raiz do
   repositório — pode arrastar e soltar direto pela interface web do GitHub
   ("Add file" → "Upload files").
3. Vá em **Settings** → **Pages**.
4. Em "Build and deployment", selecione **Deploy from a branch**, escolha a branch
   `main` e a pasta `/ (root)`. Salve.
5. Em alguns minutos o GitHub mostra a URL pública, algo como:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`
6. Esse é o link que os representantes vão acessar — funciona em qualquer navegador,
   celular ou computador.

Depois, se quiserem um domínio próprio (ex. `comparativo.giannini.com.br`), o GitHub Pages
permite configurar isso em "Settings → Pages → Custom domain" — é só apontar um registro
DNS. Posso ajudar a montar essa parte quando chegar a hora.

## Como atualizar os dados depois

Sempre que a Base de Dados do Excel for atualizada, me peçam para gerar um novo `data.json`
a partir do arquivo mais recente — vocês só precisam substituir esse único arquivo no
repositório (upload direto pela interface do GitHub já sobrescreve e republica a página
automaticamente). Não é necessário mexer em `index.html`, `style.css` ou `script.js`.

## Testar localmente antes de publicar (opcional)

Abrir o `index.html` direto no navegador (duplo clique) não funciona por uma restrição de
segurança dos navegadores ao carregar o `data.json` como arquivo local. Para testar antes
de publicar, rode um servidor local simples a partir da pasta:

```
python3 -m http.server 8000
```

E acesse `http://localhost:8000` no navegador.
