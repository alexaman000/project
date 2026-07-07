import { Model } from 'mongoose';
import { TodoDocument } from './schemas/todo.schema';
export declare class TodosService {
    private todoModel;
    constructor(todoModel: Model<TodoDocument>);
    create(createTodoDto: any, userId: string): Promise<TodoDocument>;
    findAll(userId: string): Promise<TodoDocument[]>;
    findOne(id: string, userId: string): Promise<TodoDocument | null>;
    update(id: string, updateTodoDto: any, userId: string): Promise<TodoDocument | null>;
    delete(id: string, userId: string): Promise<any>;
}
