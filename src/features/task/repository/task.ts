import {Task} from '../model/task'

interface ITaskRepository{
    findbyId(id:string): Promise<Task|null>
    findAll(): Promise<Task[]>

    Save(task:Task): Promise<void>
    Delete(id:string): Promise<void>
}

