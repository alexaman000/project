import { TodosService } from './todos.service';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    create(createTodoDto: any, req: any): Promise<import("./schemas/todo.schema").TodoDocument>;
    findAll(req: any): Promise<import("./schemas/todo.schema").TodoDocument[]>;
    findOne(id: string, req: any): Promise<import("./schemas/todo.schema").TodoDocument | null>;
    update(id: string, updateTodoDto: any, req: any): Promise<import("./schemas/todo.schema").TodoDocument | null>;
    remove(id: string, req: any): Promise<any>;
}
