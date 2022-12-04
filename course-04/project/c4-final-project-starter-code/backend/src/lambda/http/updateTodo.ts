import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo, isUserTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)

    if (!isUserTodo(userId, todoId)) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    
    const latestTodo = await updateTodo(todoId, updatedTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({
        latestTodo
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
