# gen-ai-capstone-project

## GEN AI project for :
### Exploring sematic search cpabilties of vector databases for web application content search.

### Exploring text embeddings model for generating text embeddings which will be used for vector data base search and later on with RAG architecture.

### Use LLMs for NLP with RAG architecture

## There are two different GEN AI chat agents whih are built using RAG architecture:

### Web application chat agent which can be used for search, learn about a feature, navigation etc using natural languagae processing (NLP). 
#### In order to run the app perform following steps:
##### Create new ".env" file in the root of project and add entries following variables - OPENAI_API_KEY, VECTOR_DATABASE_LOCAL_PERSIST_DIR, VECTOR_DATABASE_COLLECTION_NAME, GCP_PROJECT_ID, GCP_LOCATION, TEXT_EMBEDDINGS_MODEL_NAME
##### Install python packages
````
cd chat_bot_api
pip install -r requirements.txt
````
##### Run main api locally - 
````
fastapi dev main.py
````
##### Instal npm packages
````
cd sample-web-spa
npm i
````
##### Run SPA locally
````
npm run start
```` 
### Conversational chat agent which can be used to search as well as do conversation based on previous chat history.