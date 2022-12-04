import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { TodoItem } from '../../models/TodoItem'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    const todos: TodoItem[] = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
