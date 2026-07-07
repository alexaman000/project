import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(createTodoDto: any, userId: string): Promise<TodoDocument> {
    const createdTodo = new this.todoModel({ ...createTodoDto, userId });
    return createdTodo.save();
  }

  async findAll(userId: string): Promise<TodoDocument[]> {
    return this.todoModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<TodoDocument | null> {
    return this.todoModel.findOne({ _id: id, userId }).exec();
  }

  async update(id: string, updateTodoDto: any, userId: string): Promise<TodoDocument | null> {
    return this.todoModel.findOneAndUpdate({ _id: id, userId }, updateTodoDto, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<any> {
    return this.todoModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}
