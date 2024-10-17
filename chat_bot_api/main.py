import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from vector_store import VectorStore 
from langchain_google_vertexai import VertexAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_history_aware_retriever
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import MessagesPlaceholder

class RetrievalInput(BaseModel):
    data: str

class SearchInput(BaseModel):
    data: str

def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorStore = VectorStore()
memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)

@app.get("/")
async def root():
    return {"message": "Root end point"}

@app.get("/load_vector_db")
async def loadVectorDb():
    vectorStore.load_from_json('./web_crawl.json', os.environ.get('VECTOR_DATABASE_COLLECTION_NAME'))
    return {"message": "Vector db loaded"}

@app.get("/get_vector_db_collection")
async def getVectorDbCollection():
    colection_name = os.environ.get('VECTOR_DATABASE_COLLECTION_NAME')
    return vectorStore.get_collection(colection_name)

@app.post("/simiariy_search")
async def simiariySearch(input: SearchInput):
    colection_name = os.environ.get('VECTOR_DATABASE_COLLECTION_NAME')
    return vectorStore.similarity_search(colection_name, input.data)

@app.post("/retrieve/")
async def retrieve(input: RetrievalInput):
    retriever = vectorStore.get_retriever(os.environ.get('VECTOR_DATABASE_COLLECTION_NAME'))

    llm = VertexAI(
            model_name="gemini-1.5-flash-001",
            max_output_tokens=256,
            temperature=0.1,
            top_p=0.8,
            top_k=40,
            verbose=True,
        )
    
    chat_history = memory.load_memory_variables({})["chat_history"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", """As an AI assistant you provide answers based on the given context, ensuring accuracy and brifness. 
        You always follow these guidelines:
        -If the answer isn't available within the context, state that fact
        -Otherwise, answer to your best capability, refering to source of documents provided
        -Only use examples if explicitly requested
        -Do not introduce examples outside of the context
        -Do not answer if context is absent
        -Limit responses to three or four sentences for clarity and conciseness
        -If user is asking for an action like navigation, respond with link to the feature.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        <context>
        {context}
        </context>
        -------------------------------------------------------
        Here are Helpful Question and Answers mentioned below:
        Input: How to go to feature1?
        Output: {{"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}}
        Input: Where is feature1?
        Output: {{"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}}
        Input: What is feature1?
        Output: {{"output":"Feature1 is a feature is the application."}}
        Input: Take me to feature1.
        Output: {{"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}}
        Input: Go to feature1.
        Output: {{"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}}
        Input: Navigate to feature1.
        Output: {{"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}}
         -----------------------------------"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", """Question: {input}"""),
        ("user", """
        Format in the following JSON schema {{"output":value, "actionLink": value}}
        Do not include action link in json response if user is not trying to navigate to view.""")
    ])
    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

    document_chain = create_stuff_documents_chain(llm, prompt)
    qa_chain = create_retrieval_chain(retriever_chain, document_chain)
    response = qa_chain.invoke({"input": input.data, "context": retriever|format_docs, "chat_history": chat_history})
    memory.save_context({"input": input.data}, {"output": response['answer']})

    return response['answer']

