import os
from dotenv import load_dotenv
import vertexai
from langchain_community.document_loaders import JSONLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
import chromadb

class VectorStore:
    def __init__(self):
        load_dotenv()
        # Load env variables
        self.VECTOR_DATABASE_LOCAL_PERSIST_DIR = os.environ.get('VECTOR_DATABASE_LOCAL_PERSIST_DIR')
        self.TEXT_EMBEDDINGS_MODEL_NAME = os.environ.get('TEXT_EMBEDDINGS_MODEL_NAME')
        self.persistent_client = chromadb.PersistentClient(path=self.VECTOR_DATABASE_LOCAL_PERSIST_DIR)
    
    def load_from_json(self, file_name, collection_name_input):
        # load json file
        loader = JSONLoader(
            file_path = file_name, #'./web_crawl.json',
            jq_schema = '.[]',
            text_content = False)
        documents = loader.load()
        print(documents)
        # split documents into chunks
        # text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
        # docs = text_splitter.split_documents(documents)
        # print(f"# of documents = {len(docs)}")
        # Get embeddings from text embeddings model and load vector db
        embedding = OpenAIEmbeddings()
        vector_db = Chroma.from_documents(documents, 
                                          embedding = embedding, 
                                          collection_name=collection_name_input, 
                                          persist_directory=self.VECTOR_DATABASE_LOCAL_PERSIST_DIR,
                                          client=self.persistent_client,
                                          collection_metadata={
                                                "hnsw:space": "cosine",
                                            })
        
    def get_collection(self, collection_name):
        print(self.persistent_client.get_collection(collection_name).
              get(include=['embeddings', 'documents', 'metadatas'], offset=0, limit=10))
        return self.persistent_client.get_collection(collection_name).get()
    
    def similarity_search(self, collection_name_input, input):
        embeddings = OpenAIEmbeddings()
        vectordb = Chroma(
                persist_directory=self.VECTOR_DATABASE_LOCAL_PERSIST_DIR, 
                embedding_function=embeddings,
                collection_name=collection_name_input,
                collection_metadata={
                    "hnsw:space": "cosine",
                }
            )
        return vectordb.similarity_search_with_score(input, 2)
    
    def get_retriever(self, collection_name_input):
        embeddings = OpenAIEmbeddings()
        vectordb = Chroma(
            persist_directory=self.VECTOR_DATABASE_LOCAL_PERSIST_DIR, 
            embedding_function=embeddings,
            collection_name=collection_name_input
            )
        retriever = vectordb.as_retriever(search_type='mmr')
        return retriever