import httpStatus from "http-status";
import {User} from "../models/user.model.js";
import bcrypt ,{ hash } from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

export const login = async (req, res) => {
    const { userName, password } = req.body;


    if(!userName || !password){
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please enter all fields" });
    }
        
    try {
        const user = await User.findOne({ userName });
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({ message: "Invalid credentials" });
        }

        let isMatch = await bcrypt.compare(password, user.password);
        if(isMatch) {
            // console.log('Password match');
            const token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token });
        } else {
            // console.log('Password does not match');
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


export const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.userName })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}



export const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.userName,
            meeting_code: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}
//<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>