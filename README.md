# 🎮 GameReviewD 🎮

> Projeto full stack desenvolvido para fins acadêmicos, utilizando React, Node, Express e PostgreSQL.

## Descrição
O GameReviewD é uma aplicação web de catálogo de jogos eletrônicos com funcionalidades inspiradas em plataformas de organização e avaliação de jogos. O sistema permite que os usuários explorem o catálogo, registrem suas opiniões sobre os jogos e organizem suas experiências de acordo com seus interesses.
A plataforma também possui funcionalidades sociais, permitindo que os usuários acompanhem outros perfis, visualizem avaliações e mantenham uma coleção pessoal de jogos, além de poderem favoritar seus jogos preferidos.

## Objetivos 🎯
O objetivo geral do projeto é desenvolver uma aplicação web que permita catalogar, avaliar e organizar jogos eletrônicos, utilizando tecnologias de desenvolvimento web e banco de dados relacionais.

### Objetivos específicos:
- Desenvolver uma API REST para gerenciar os dados da aplicação;
- Implementar um sistema de autenticação e controle de acesso por tipo de usuário;
- Permitir a realização de avaliações com notas e comentários;
- Possibilitar a organização de jogos em coleções pessoais e favoritos;
- Implementar funcionalidades sociais, como seguir outros usuários;
- Relacionar jogos a suas desenvolvedoras, plataformas e gêneros;
- Aplicar operações de CRUD.

## Funcionalidades do projeto
As funcionalidades e as permissões são divididas entre usuários comuns e administradores.

### Usuário comum 👤
- Consultar o catálogo de jogos, com busca por nome e filtro por gênero;
- Ver a página de cada jogo, com descrição, desenvolvedoras, plataformas, gêneros, média e avaliações de outros usuários;
- Avaliar jogos com notas de 1 a 5 estrelas e comentários (editar e apagar as avaliações pelo perfil);
- Organizar jogos em uma coleção pessoal, alterando o status (quero jogar, jogando, finalizado ou abandonado);
- Adicionar jogos aos favoritos;
- Visualizar o perfil de outros usuários (coleção e avaliações), além de seguir e deixar de seguir;

### Administrador 💼
- Cadastrar, consultar, editar e excluir jogos, incluindo suas desenvolvedoras, plataformas e gêneros;
- Cadastrar, editar e excluir desenvolvedoras, plataformas e gêneros;
- Gerenciar usuários (visualizar e excluir contas);

### Páginas do frontend 🗺️

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial, com lista de jogadores e catálogo de jogos |
| `/login` e `/cadastro` | Autenticação e criação de conta |
| `/jogo/:id` | Página do jogo, com avaliações, coleção e favoritos |
| `/me/profile` | Perfil do usuário logado (coleção, favoritos, avaliações, seguidores e seguindo) |
| `/usuario/:id` | Perfil de outro usuário |
| `/administracao` | Menu de funções do administrador |
| `/admin/jogo/adicionar` e `/admin/jogo/editar` | CRUD de jogos |
| `/admin/plataforma/adicionar` e `/admin/plataforma/editar` | CRUD de plataformas |
| `/admin/genero/adicionar` e `/admin/genero/editar` | CRUD de gêneros |
| `/admin/desenvolvedora/adicionar` e `/admin/desenvolvedora/editar` | CRUD de desenvolvedoras |
| `/admin/usuarios` | Gerenciamento de usuários |

## Como iniciar o projeto 🚀

### Pré-requisitos

Antes de iniciar o projeto, veja se sua máquina possui:

- Docker

## Backend ⚙️
Antes da execução dos comandos abaixo, na pasta raiz do projeto crie um arquivo ".env" com as seguintes informações:

```
JWT_SECRET=
PORT=3000
DB_HOST=database
DB_USER=usuario
DB_PASS=senha
DB_NAME=bancodados
DB_PORT=5432
PGWEB_PORT=8081
```

O JWT_SECRET no arquivo é uma chave secreta usada pelo servidor para assinar e validar os tokens JWT. Ele irá garantir que o token foi gerado pela sua aplicação e que ninguém alterou os dados dele no caminho.

Como parâmetro para ele, utilize algum valor de sua preferência. 
Mas se preferir uma chave mais criptografada, execute o seguinte comando no terminal: 

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Após isso, acrescente o valor ao lado do JWT_SECRET, sem utilizar aspas ou espaço.

Agora, no terminal, abra a pasta raiz do projeto (onde está o arquivo "docker-compose.yml") e execute o seguinte comando:

```bash
docker compose up --build -d
```
Caso queira resetar ou recriar os contêiners, além do banco de dados (os dados atuais serão perdidos), execute o comando:

```bash
docker compose down -v
```

Após a inicialização, o webservice pode ser acessado em http://localhost:3000. A interface gráfica de controle do banco de dados pode ser acessada em http://localhost:8081.

## Frontend 💻
O comando do Docker acima também inicializa o frontend, que pode ser acessado em http://localhost:5173.

Caso prefira executar o frontend fora do Docker, suba apenas o backend e o banco com `docker compose up --build -d node database pgweb`, abra a pasta do frontend no terminal e execute os seguintes comandos:

```bash
npm install
npm run dev
```

O comando "npm install" instala as dependências no projeto, e o "npm run dev" inicializa o servidor React.
Após a inicialização, o site pode ser acessado em http://localhost:5173.

> O frontend acessa a API em http://localhost:3000, então o backend precisa estar em execução.

## Credenciais de acesso 🔑

Para avaliação, o projeto já vem com as tabelas do banco de dados preenchidas, com dois tipos de conta para verificar as funcionalidades de cada tipo de usuário.

### Admistrador
- Usuário: vtoz
- Senha: vtozadmin19

### Usuário comum
- Usuário: user
- Senha: userx26

As credenciais são destinadas exclusivamente à avaliação do projeto. O sistema armazena as senhas no banco de dados em formato de hash.
