import httpStatus from "http-status";
import {User} from "../models/user.model.js";
import bcrypt ,{ hash } from "bcrypt";
import crypto from "crypto";

export const login = async (req, res) => {
    const { userName, password } = req.body;


    if(!userName || !password){
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please enter all fields" });
    }
        
    try {
        const user = await User.findOne({ userName });
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        let isMatch = await bcrypt.compare(password, user.password);
        if(isMatch) {
            console.log('Password match');
            const token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token });
        } else {
            console.log('Password does not match');
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }
    }catch(error){
        res.status(400).json({ error: error.message });
    }
        
}



export const register = async (req, res) => {
    const { name, userName, password } = req.body;
    try {
        const existingUser = await User.findOne({ userName });
        if(existingUser){
           return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            userName,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(httpStatus.CREATED).json({ message: "User created successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


//<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>