import User from "../models/User.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        res.json({
            "success": false,
            "Error": error
        })
    }
}

export const addUser = async (req, res) => {
    try {
        const {username, password} = req.body;

        const newUser = new User({
            username,
            password
        })

        const savedUser = await newUser.save();

        res.json({
            "success": true,
            "data": savedUser
        })
    }
    catch (error) {
        res.json({
            "success": false,
            "Error": error
        })
    }
}