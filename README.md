# 🎮 GameReviewD 🎮

> Projeto full stack desenvolvido para fins acadênicos, utilizando React, Node, Express e PostgreSQL.

## Descrição
O GameReviewD é uma aplicação web de catálogo de jogos eletrônicos com funcionalidades inspiradas em plataformas de organização e avaliação de jogos. O sistema permite que os usuários explorem o catálogo, registrem suas opiniões sobre os jogos e organizem suas experiências de acordo com seus interesses.
A plataforma também possui funcionalidades sociais, permitindo que os usuários acompanhem outros perfis, visualizem avaliações e mantenham uma colecção pessoal de jogos, além de poderem favoritar seus jogos preferidos.
Além disso, os usuários podem solicitar a inclusão de jogos que ainda não estão disponíveis no catálogo. Essas solicitações são analisadas pelos administradores, que podem aprová-las ou rejeitá-las.

## Objetivos
O objetivo geral do projeto é desenvolver uma aplicação web que permita catalogar, avaliar e organizar jogos eletrônicos, utilizando tecnologias de desenvolvimento web e banco de dados relacionais.

### Objetivos específicos:
- Desenvolver uma API REST para gerenciar os dados da aplicação;
- Implementar um sistema de autenticação e controle de acesso por tipo de usuário;
- Permitir a realização de avaliações com notas e comentários;
- Possibilitar a organização de jogos em coleções pessoais e favoritos;
- Implementar funcionalidades sociais, como seguir outros usuários;
- Permitir solicitações de inclusão de jogos, com análise por admnistradores;
- Relacionar jogos a suas desenvolvedoras, plataformas e gêneros;
- Aplicar operações de CRUD.

## Funcionalidades do projeto
As funcionalidades e as permissões são divididas entre usuários comuns e administradores.

### Usuário comum
- Consultar o catálogo de jogos;
- Avaliar jogos com notas de 1 a 5 estrelas e comentários;
- Consultar o histórico de alterações das próprias avaliações;
- Organizar jogos em uma coleção pessoal;
- Adicionar jogos aos favoritos;
- Visualizar e acompanhar outros usuários, além de consegui-los;
- Solicitar inclusão de jogos no catálogo ao administrador;
- Conseguir ver o status de suas solicitações.

### Admistrador
- Cadastrar, consultar, editar e excluir jogos;
- Gerenciar desenvolvedoras, plataformas e gêneros;
- Consultar solicitações de inclusão de jogos feitas por usuários;
- Aprovar ou rejeitar as solicitações.

### Como iniciar o projeto

## Pré-requisitos

Antes de iniciar o projeto, veja se sua máquina possui:

- Docker

## Backend
No terminal, abra a pasta do backend e execute o seguinte comando:

```bash
docker compose up --build -d
```
Caso queira resetar ou recriar os contêiners, além do banco de dados (os dados atuais serão perdidos), execute o comando:

```bash
docker compose down -v
```

Após a inicialização, o webservice pode ser acessado em http://localhost:3000. A interface gráfica de controle do banco de dados pode ser acessada em http://localhost:8081.

## Frontend
No terminal, abra a pasta do frontend e execute os seguintes comandos:

```bash
npm install
npm run dev
```

O comando "npm ins
