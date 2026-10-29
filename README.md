# Portfólio | Igor Mendes, Analista de Dados

Site pessoal com experiência, projetos, certificações e contato.

🔗 **Acesse:** https://ig0rmendes.github.io/portifolio_projetos/

## Estrutura

```
.
├── index.html                  # página única (HTML + CSS, sem dependências)
├── curriculo-igor-mendes.pdf   # currículo, aberto em nova aba pelo site
├── certificados/               # imagens dos certificados (.jpg)
└── images/
    ├── foto_perfil.jpg
    └── projetos/               # prints dos projetos
```

## Como atualizar

### Currículo

Substitua `curriculo-igor-mendes.pdf` por um arquivo com **exatamente o mesmo nome**. Os botões do site já apontam para ele.

### Novo projeto

1. Salve um print do projeto em `images/projetos/`.
2. No `index.html`, copie o bloco `<article class="case">` da seção **Projetos** e troque textos, números, ferramentas e links.
3. No novo bloco, adicione `style="margin-top:24px;"` ao `<article>` para separar os cards.

### Novo certificado

1. Salve a imagem em `certificados/`, com nome em minúsculo e sem espaços (ex.: `power-bi-comunidade-ds.jpg`).
2. No `index.html`, copie um bloco `<a class="cred">` da seção **Formação** e troque o link, o nome, a instituição e o ano.

> O GitHub Pages diferencia maiúsculas e minúsculas: `.jpg`, `.JPG` e `.jpeg` são nomes diferentes. O link no HTML precisa ser idêntico ao nome do arquivo.

## Contato

[LinkedIn](https://www.linkedin.com/in/igor-mendes-a50550239/) · [GitHub](https://github.com/Ig0rMendes) · igorsamendes13@gmail.com
