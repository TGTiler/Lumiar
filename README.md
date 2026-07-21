# Lumiar Store

Loja alternativa de apps, mods e ports da comunidade Android. App nativo desenvolvido com Expo/React Native.

---

## Estrutura do Projeto

```
Lumiar/
├── LumiarApp/                  # App nativo Android (Expo/React Native)
│   ├── App.tsx                 # Entry point com navegação
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── AppCard.tsx     # Cards de apps (destaque + lista)
│   │   │   ├── BottomNav.tsx   # Barra de navegação inferior
│   │   │   └── ProfileModal.tsx # Modal de perfil do usuário
│   │   ├── screens/            # Tela do aplicativo
│   │   │   ├── HomeScreen.tsx  # Tela principal com categorias
│   │   │   ├── AppDetailScreen.tsx # Detalhes do app
│   │   │   └── SettingsScreen.tsx  # Configurações
│   │   ├── services/
│   │   │   └── api.ts          # Consumo da API GitHub (JSON)
│   │   └── constants/
│   │       └── theme.ts        # Cores, fontes, espaçamentos
│   └── app.json                # Configuração Expo
├── JSON/
│   ├── apps.json               # Lista de apps disponíveis
│   ├── categorias.json         # Categorias e subcategorias
│   └── Version.json            # Versão atual da loja
├── APK/
│   └── Lumiar-v1.0.5.apk      # Último release compilado
└── README.md
```

---

## Funcionalidades

- **Design Moderno** - Interface estilo Google Play Store / App Store
- **Navegação por Abas** - Bottom Nav com Início e Configurações
- **Perfil Local** - Avatar e nome salvos via AsyncStorage
- **Categorias em Chips** - Barra horizontal com scroll e filtragem
- **Destaques Automáticos** - Últimos 5 apps + flag `"Destaque": true`
- **Busca em Tempo Real** - Filtragem por nome, descrição e categoria
- **Fallback de Imagens** - Gradiente roxo com inicial quando URL falha
- **Sync com GitHub** - Atualização automática dos dados via JSON remoto
- **Download de APKs** - Abertura direta do link de download

---

## Como Funciona

### JSON de Apps (`JSON/apps.json`)

Cada app é um objeto com estas propriedades:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ID` | string | Identificador único |
| `NomeAPP` | string | Nome exibido na loja |
| `Versao` | string | Versão atual do APK |
| `Descricao` | string | Descrição curta do app |
| `logo` | string | URL da logo (ImgBB ou outro host) |
| `img1` | string | URL da screenshot 1 |
| `img2` | string | URL da screenshot 2 |
| `url_apk` | string | URL direta para download |
| `categoria` | string | Nome da categoria |
| `CategoriaSlug` | string | Slug da categoria |
| `SubcategoriaSlug` | string | Slug da subcategoria |
| `Destaque` | boolean | Opcional: incluir nos destaques |

### JSON de Versão (`JSON/Version.json`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Versao` | string | Versão da loja (formato semver) |
| `Download` | string | URL de download da atualização |
| `Changelog` | string | Descrição das mudanças |

---

## Como Adicionar um App

1. Faça upload do APK para um host (GitHub Releases, etc.)
2. Faça upload das imagens (logo, screenshots) para ImgBB ou similar
3. Adicione o objeto no `JSON/apps.json`:

```json
{
  "ID": "com.meuapp",
  "NomeAPP": "Meu App",
  "Versao": "v1.0.0",
  "Descricao": "Descrição curta do app.",
  "CategoriaSlug": "utilidades",
  "SubcategoriaSlug": "",
  "logo": "https://i.ibb.co/exemplo/logo.png",
  "img1": "https://i.ibb.co/exemplo/screen1.png",
  "img2": "https://i.ibb.co/exemplo/screen2.png",
  "url_apk": "https://exemplo.com/meuapp.apk",
  "categoria": "Utilidades",
  "subcategoria": ""
}
```

4. Faça push para o GitHub
5. O app atualiza automaticamente no próximo sync

---

## Hospedagem dos Dados

Os dados da loja (apps, categorias, versão) ficam hospedados no GitHub:

```
https://raw.githubusercontent.com/TGTiler/Lumiar/main/JSON/apps.json
https://raw.githubusercontent.com/TGTiler/Lumiar/main/JSON/categorias.json
https://raw.githubusercontent.com/TGTiler/Lumiar/main/JSON/Version.json
```

---

## Tecnologias

- **Expo SDK 57** - Framework React Native
- **React Native 0.86** - UI nativa
- **AsyncStorage** - Dados locais (perfil)
- **Ionicons** - Ícones
- **GitHub API** - Hospedagem de dados JSON

---

## Build do APK

```bash
cd LumiarApp
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

O APK gerado fica em `android/app/build/outputs/apk/release/`.

---

## Licença

MIT - TGTiler © 2026
