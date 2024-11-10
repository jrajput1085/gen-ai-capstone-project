import json
from operator import itemgetter
import os
import re
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from vector_store import VectorStore 
from langchain_google_vertexai import VertexAI, ChatVertexAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_history_aware_retriever
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_core.output_parsers import StrOutputParser
from openai import OpenAI, pydantic_function_tool

load_dotenv()

vectorStore = VectorStore()

app = FastAPI()

class RetrievalInput(BaseModel):
    data: str

class SearchInput(BaseModel):
    data: str

class RetrieveWithToolOutputModel(BaseModel):
    output: str
    actionLink: str
    takeAction: bool

class QueryKnowledgeBaseTool(BaseModel):
    """Query the knowledge base to answer the user questions."""
    query_input: str = Field(description='The natural language query input. The query input should be clear and standalone.')

    def __call__(self):
        colection_name = os.environ.get('VECTOR_DATABASE_COLLECTION_NAME')
        result = vectorStore.similarity_search(colection_name, self.query_input)
        returnVal = list()
        returnVal.append(result[0][0].page_content)
        returnVal.append(result[1][0].page_content)
        return '\n\n---\n\n'.join(returnVal) + '\n\n---'

def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

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

@app.post("/retrieve")
async def retrieve(input: RetrievalInput):
    retriever = vectorStore.get_retriever(os.environ.get('VECTOR_DATABASE_COLLECTION_NAME'))

    # llm = ChatVertexAI(
    #         model_name=os.environ.get("LLM_MODEL_NAME"),
    #         max_output_tokens=256,
    #         temperature=0.1,
    #         top_p=0.8,
    #         top_k=40,
    #         verbose=True,
    #         generation_config={"response_mime_type": "application/json"}
    #     )
    
    llm = ChatOpenAI(model_name='gpt-3.5-turbo', temperature=0, streaming=True)

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
        Format in the following JSON schema {{"output": "value", "actionLink": "value"}}
        Do not include action link in json response if user is not trying to navigate to view.
        Include action link if user is trying to navigate to a view or askig to take to that view.""")
    ])
    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

    document_chain = create_stuff_documents_chain(llm, prompt)
    qa_chain = create_retrieval_chain(retriever_chain, document_chain)
    response = qa_chain.invoke({"input": input.data, "context": retriever|format_docs, "chat_history": chat_history})
    # response['answer'] = extract_json(response['answer'].replace("'", "\""))
    memory.save_context({"input": input.data}, {"output": response['answer']})
    return response['answer']

@app.post("/retrieve_with_tools", response_model=RetrieveWithToolOutputModel)
async def retrieveWithTools(input: RetrievalInput):
    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

    SYSTEM_PROMPT = """
    As an AI assistant you provide answers based on the given context, ensuring accuracy and brifness. 
    You always follow these guidelines:
    -If the answer isn't available within the context, state that fact
    -Otherwise, answer to your best capability, refering to source of documents provided
    -Only use examples if explicitly requested
    -Do not introduce examples outside of the context
    -Do not answer if context is absent
    -Limit responses to three or four sentences for clarity and conciseness
    -If user is asking for an action like navigation, respond with link to the feature without including actual host name.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    -------------------------------------------------------
    Here are Helpful Question and Answers mentioned below:
    Input: How to go to feature1?
    Output: {"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}
    Input: Where is feature1?
    Output: {"output":"Click on the left menu feature1 option.", "actionLink": "/feature1"}
    Input: What is feature1?
    Output: {"output":"Feature1 is a feature in the application.", "actionLink": "/feature1"}
    Input: Take me to feature1.
    Output: {"output":"Click on the left menu feature1 option.", "actionLink": "/feature1", "takeAction": true}
    Input: Go to feature1.
    Output: {"output":"Click on the left menu feature1 option.", "actionLink": "/feature1", "takeAction": true}
    Input: Navigate to feature1.
    Output: {"output":"Click on the left menu feature1 option.", "actionLink": "/feature1", "takeAction": true}
    -----------------------------------
    To ensure you provide the most up-to-date and accurate information, always use the QueryKnowledgeBaseTool to retrieve relevant information before answering user queries. 
    You are a reliable assistant and your answers must always be based on truth.
    """

    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': input.data}
    ]

    response = client.beta.chat.completions.parse(
        model='gpt-4o-mini',
        messages=messages,
        tools=[pydantic_function_tool(QueryKnowledgeBaseTool)],
    )
    content = response.choices[0].message.content

    # If no tool calls return the basic response. This can happen when query is for out of context data
    if len(response.choices[0].message.tool_calls) == 0:
        try:
            return RetrieveWithToolOutputModel(json.loads(content))
        except ValueError as e:
             return RetrieveWithToolOutputModel(output=content, actionLink="", takeAction=False)
        
    
    tool_call = response.choices[0].message.tool_calls[0]

    messages.append({
        "role": "assistant",
        "content": "",
        "tool_calls": [{
        "type": "function",
        "id": tool_call.id,
        'function': {"name": tool_call.function.name, "arguments": tool_call.function.arguments}
        }]
    })

    print(content)

    # kb_tool is an instance of QueryKnowledgeBaseTool
    kb_tool = tool_call.function.parsed_arguments

    print(kb_tool.query_input)

    # The __call__ method allows us to call the tool to perform the query
    kb_result = kb_tool()

    messages.append(
        {'role': 'tool', 'tool_call_id': tool_call.id, 'name': 'QueryKnowledgeBaseTool', 'content': kb_result}
    )
    response = client.beta.chat.completions.parse(
        model='gpt-4o-mini',
        messages=messages,
        response_format=RetrieveWithToolOutputModel
    )
    content = response.choices[0].message.content

    print(content)

    return json.loads(content)
