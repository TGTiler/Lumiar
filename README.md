# Lumiar — Loja Alternativa de Apps

Loja de aplicativos alternativos, mods e ports da comunidade.

---

## Estrutura do Projeto

```
Lumiar/
├── APP/
│   └── index.html              # Web App principal (HTML + CSS + JS)
├── JSON/
│   ├── Version.json            # Controle de versão da Lumiar
│   └── apps.json               # Lista de apps disponíveis
├── .mimocode/
│   ├── skills/                 # Skills de desenvolvimento
│   ├── agents/                 # Personas de especialista
│   ├── rules/                  # Regras de código
│   └── knowledge/              # Base de conhecimento
├── AGENTS.md                   # Configuração do agente
├── opencode.json               # Configuração do OpenCode
└── README.md                   # Este arquivo
```

---

## Como Funciona

### JSON de Apps (`JSON/apps.json`)

Cada app é um objeto com estas propriedades:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ID` | string | Identificador único do app (usado na pesquisa) |
| `NomeAPP` | string | Nome exibido na loja |
| `Versao` | string | Versão atual do APK |
| `logo` | string | URL da imagem do logo (120x120 recomendado) |
| `img1` | string | URL da primeira screenshot (400x700 recomendado) |
| `img2` | string | URL da segunda screenshot |
| `url_apk` | string | URL direta para download do APK |
| `descricao` | string | Descrição do app |

### JSON de Versão (`JSON/Version.json`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Versao` | string | Versão atual da loja (formato semver: X.Y.Z) |
| `Download` | string | URL de download da atualização |
| `Changelog` | string | Descrição das mudanças |

---

## Como Adicionar um App

1. Abra `JSON/apps.json`
2. Adicione um novo objeto no array:

```json
{
  "ID": "meu-app",
  "NomeAPP": "Meu App",
  "Versao": "1.0.0",
  "logo": "https://exemplo.com/logo.png",
  "img1": "https://exemplo.com/screenshot1.png",
  "img2": "https://exemplo.com/screenshot2.png",
  "url_apk": "https://exemplo.com/app.apk",
  "descricao": "Descrição do app."
}
```

3. Faça push para o GitHub
4. O web app carrega automaticamente

---

## URLs de Exemplo (GitHub Raw)

Para apps hospedados no GitHub:

```
https://raw.githubusercontent.com/{usuario}/{repo}/main/JSON/apps.json
https://raw.githubusercontent.com/{usuario}/{repo}/main/JSON/Version.json
```

---

## Hospedagem

### Opção 1: GitHub Pages
1. Ative GitHub Pages no repo
2. Acesse: `https://{usuario}.github.io/{repo}/APP/`

### Opção 2: Servidor Local
1. Instale um servidor local (ex: Live Server no VS Code)
2. Abra a pasta `APP/`

### Opção 3: Qualquer Hosting Estático
- Netlify, Vercel, Cloudflare Pages, etc.
- Pasta de build: `APP/`

---

## Desenvolvimento

### Tecnologias
- HTML5, CSS3, JavaScript (ES2024+)
- Fuse.js (busca fuzzy via CDN)
- Google Fonts (Inter)

### Funcionalidades
- Splash Screen animada
- Busca em tempo real com tolerância a erros
- Verificação automática de atualizações
- Download direto de APKs
- Navegação por dock flutuante
- Design responsivo mobile-first
- Glassmorphism e animações suaves
