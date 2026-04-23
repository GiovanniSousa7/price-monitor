# 📊 Price Monitor

Sistema de monitoramento de preços de produtos do Mercado Livre,
com pipeline completo de coleta, armazenamento, análise e alertas.

## Arquitetura

[Mercado Livre API] → [Python Collector] → [PostgreSQL/Supabase]
↓
[n8n Alerts] ← [FastAPI Backend] → [Next.js Dashboard]

## Tecnologias

- **Coleta:** Python + GitHub Actions
- **Banco:** PostgreSQL via Supabase
- **Backend:** FastAPI
- **Frontend:** Next.js
- **Automações:** n8n

## Como rodar localmente

1. Clone o repositório
2. Crie o ambiente virtual: `python -m venv venv`
3. Ative: `venv\Scripts\activate`
4. Instale dependências: `pip install -r requirements.txt`
5. Copie o `.env.example` para `.env` e preencha as credenciais
6. Execute o coletor: `python collector/main.py`

## Status

🚧 Em desenvolvimento