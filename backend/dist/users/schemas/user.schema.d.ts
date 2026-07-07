import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    email: string;
    passwordHash: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, any, any, User>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, User, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    email?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    passwordHash?: import("mongoose").SchemaDefinitionProperty<string, User, Document<unknown, {}, User, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, User>;
