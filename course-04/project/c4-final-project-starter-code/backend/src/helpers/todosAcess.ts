import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info({message: `Getting all todos to user ${userId}`})

        const result = await this.docClient.query({
            TableName: this.todosTable,
            QueryFilter: {
                userId: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [userId]
                }
            }
        }).promise()

        const todos = result.Items
        return todos as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info({message: `Creating new todo to user ${todo.userId}`})

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todoId: string, { name, dueDate, done }: TodoUpdate): Promise<TodoItem> {
        logger.info(`Updating todo item ${todoId}`)

        const updatedTodo = await this.docClient.update({
            TableName: this.todosTable,
            Key: { id: todoId },
            AttributeUpdates: {
                "name": {
                    Action: "PUT",
                    Value: name
                },
                "dueDate": {
                    Action: "PUT",
                    Value: dueDate
                },
                "done": {
                    Action: "PUT",
                    Value: done
                }
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return updatedTodo.Attributes as TodoItem
    }

   async deleteTodo(todoId: String)  {
        logger.info(`Deleting todo item ${todoId}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { id: todoId }
        }).promise()
   }

   async getTodo(todoId: String): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: { id: todoId }
        }).promise()

        const todo = result.Item
        return todo as TodoItem
   }

   async addImage(todoId: string, imageUrl: string) {
        logger.info(`Adding image to todo ${todoId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: { id: todoId },
            AttributeUpdates: {
                "attachmentUrl": {
                    Action: "PUT",
                    Value: imageUrl
                }
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
   }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  
