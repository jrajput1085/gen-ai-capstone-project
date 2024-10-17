# gen-ai-capstone-project

## This repository contains code for GEN AI project for :
### Exploring sematic search cpabilties of vector databases for web application content search.

### Exploring text embeddings model for generating text embeddings which will be used for vector data base search and later on with RAG architecture.

## There are two different GEN AI chat agents whih are built using RAG architecture:

### Web application chat agent which can be used for search, learn about a feature, navigation etc using natural languagae processing (NLP). 
#### In order to run the app perform following steps:
##### Create new ".env" file in the root of project and add entries following variables - VECTOR_DATABASE_LOCAL_PERSIST_DIR,VECTOR_DATABASE_COLLECTION_NAME, GCP_PROJECT_ID, GCP_LOCATION, TEXT_EMBEDDINGS_MODEL_NAME
##### Run the main api - 
````
fastapi dev main.py
````
            
### Conversational chat agent which can be used to search as well as do conversation based on previous chat history.