import User from "./user.model"

class UserRepository 
{
    public async findOne(queryOptions: any) 
    {
        return await User.findOne({username: queryOptions.username}).exec()
    }

    public async findById(userId: string, selects?: string[]) 
    {
        if (selects) {
            let selectedFields = '';
            for (const field of selects) {
                selectedFields += field + ' ';
            }
            return await User.findById(userId).select(selectedFields).exec();
        } 
        return await User.findById(userId).exec();
    }

    public async create(userData: any) 
    {
        const newUser = new User(userData)
        return await newUser.save();
    }
}

export default UserRepository;