import { Document, Types } from 'mongoose';
export type TodoDocument = Todo & Document;
export declare class Todo {
    title: string;
    description: string;
    isCompleted: boolean;
    userId: Types.ObjectId;
}
export declare const TodoSchema: import("mongoose").Schema<Todo, import("mongoose").Model<Todo, any, any, any, any, any, Todo>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Todo, Document<unknown, {}, Todo, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Todo & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Todo, Document<unknown, {}, Todo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Todo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Todo, Document<unknown, {}, Todo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Todo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isCompleted?: import("mongoose").SchemaDefinitionProperty<boolean, Todo, Document<unknown, {}, Todo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Todo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Todo, Document<unknown, {}, Todo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Todo & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Todo>;
