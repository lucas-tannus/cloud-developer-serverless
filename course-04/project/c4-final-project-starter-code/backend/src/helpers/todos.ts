import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

const logger = createLogger('todos')

export async function createTodo(todo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    try {
        const todoId = uuid.v4()
    
        return await todosAccess.createTodo({
            todoId,
            userId,
            createdAt: new Date().toISOString(),
            name: todo.name,
            dueDate: todo.dueDate,
            done: false
        })
    } catch (e) {
        logger.warn(`Failed creating new todo: ${e}`)
        throw e
    }
}

export async function updateTodo(todoId: string, todo: UpdateTodoRequest) {
    await todosAccess.updateTodo(todoId, todo)
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getAllTodos(userId)
}

export async function deleteTodo(todoId: string) {
    await todosAccess.deleteTodo(todoId)
}

export async function isUserTodo(userId: string, todoId: string) {
    const todo: TodoItem = await todosAccess.getTodo(todoId)
    return todo.userId == userId
}

export async function addImage(todoId: string) {
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await todosAccess.addImage(todoId, imageUrl)
}
