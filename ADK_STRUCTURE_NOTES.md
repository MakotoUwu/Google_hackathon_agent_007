# Google ADK Project Structure

## Правильна структура проекту:

```
parent_folder/
    maps_agent/           # Назва агента (папка)
        __init__.py       # Імпорт: from . import agent
        agent.py          # Визначення root_agent
        .env              # API ключі
```

## Ключові моменти:

1. **Назва папки = назва агента** - використовується в `adk web` та `adk api_server`
2. **`__init__.py`** - ОБОВ'ЯЗКОВИЙ файл з `from . import agent`
3. **`agent.py`** - містить `root_agent = Agent(...)`
4. **`.env`** - містить `GOOGLE_API_KEY` та інші секрети

## Команди для тестування:

### Запуск dev UI:
```bash
cd parent_folder/
adk web
```

### Запуск API server:
```bash
cd parent_folder/
adk api_server
```

### Тестування через curl:
```bash
# Створити сесію
curl -X POST http://localhost:8000/apps/maps_agent/users/u_123/sessions/s_123 \
  -H "Content-Type: application/json" \
  -d '{"state": {}}'

# Надіслати запит
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "maps_agent",
    "user_id": "u_123",
    "session_id": "s_123",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Find Italian restaurants in Kyiv"}]
    }
  }'
```

## Agent.py structure:

```python
from google.adk.agents import Agent

# Визначити root_agent (не інше ім'я!)
root_agent = Agent(
    name="agent_name",
    model="gemini-2.0-flash",
    description="...",
    instruction="...",
    tools=[...]  # Function tools або google_search
)
```

## Для google_search grounding:

```python
from google.adk.tools import google_search

root_agent = Agent(
    name="maps_agent",
    model="gemini-2.0-flash",
    tools=[google_search]
)
```
