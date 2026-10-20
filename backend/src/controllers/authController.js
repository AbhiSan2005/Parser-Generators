import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google ID token credential is required."
            });
        }

        let payload;
        const clientId = process.env.GOOGLE_CLIENT_ID;

        // If client ID is set, verify cryptographically against Google's certs
        if (clientId) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        } else {
            // Development fallback: decode JWT token payload without verification if no CLIENT_ID set yet
            const parts = credential.split(".");
            if (parts.length === 3) {
                payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Malformed Google credential token."
                });
            }
        }

        if (!payload || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: "Could not retrieve user info from Google token."
            });
        }

        const { sub: googleId, email, name, picture } = payload;

        // Find existing user by googleId or email
        let user = await User.findOne({
            $or: [
                { googleId },
                ...(email ? [{ email }] : [])
            ]
        });

        if (!user) {
            // Create a brand new user
            user = new User({
                username: name || (email ? email.split("@")[0] : "Google User"),
                email: email || "",
                googleId,
                avatar: picture || ""
            });
            await user.save();
        } else {
            // Update user details if not yet linked
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            if (picture && user.avatar !== picture) {
                user.avatar = picture;
                updated = true;
            }
            if (name && !user.username) {
                user.username = name;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        return res.json({
            success: true,
            data: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to authenticate with Google."
        });
    }
};

export const getAuthUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.json({
            success: true,
            data: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
