import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'
import { getUserId } from '../utils'
import { isUserTodo, addImage } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    if (!isUserTodo(userId, todoId)) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    const presignedUrl = createAttachmentPresignedUrl(todoId)
    
    addImage(todoId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        updloadUrl: presignedUrl
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
