import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findOne(email: string): Promise<UserDocument | null>;
    create(email: string, passwordHash: string): Promise<UserDocument>;
}
