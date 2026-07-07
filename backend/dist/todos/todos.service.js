"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const todo_schema_1 = require("./schemas/todo.schema");
let TodosService = class TodosService {
    todoModel;
    constructor(todoModel) {
        this.todoModel = todoModel;
    }
    async create(createTodoDto, userId) {
        const createdTodo = new this.todoModel({ ...createTodoDto, userId });
        return createdTodo.save();
    }
    async findAll(userId) {
        return this.todoModel.find({ userId }).exec();
    }
    async findOne(id, userId) {
        return this.todoModel.findOne({ _id: id, userId }).exec();
    }
    async update(id, updateTodoDto, userId) {
        return this.todoModel.findOneAndUpdate({ _id: id, userId }, updateTodoDto, { new: true }).exec();
    }
    async delete(id, userId) {
        return this.todoModel.findOneAndDelete({ _id: id, userId }).exec();
    }
};
exports.TodosService = TodosService;
exports.TodosService = TodosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(todo_schema_1.Todo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TodosService);
//# sourceMappingURL=todos.service.js.map