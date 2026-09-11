const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function login_user(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await db.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const password_matches = await bcrypt.compare(password, user.password);
    if (password_matches === false) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token_payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const access_token = jwt.sign(token_payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m"
    });

    const refresh_token = jwt.sign(token_payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d"
    });

    await db.user.update({
      where: {
        id: user.id
      },
      data: {
        refresh_token: refresh_token
      }
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      access_token: access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function refresh_access_token(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing"
      });
    }

    const refresh_token = cookies.refresh_token;
    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing"
      });
    }

    let decoded_user;
    try {
      decoded_user = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded_user.id
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.refresh_token !== refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token does not match record"
      });
    }

    const token_payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const new_access_token = jwt.sign(token_payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m"
    });

    return res.status(200).json({
      success: true,
      access_token: new_access_token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function logout_user(req, res) {
  try {
    const cookies = req.cookies;
    if (cookies) {
      const refresh_token = cookies.refresh_token;
      if (refresh_token) {
        await db.user.updateMany({
          where: {
            refresh_token: refresh_token
          },
          data: {
            refresh_token: null
          }
        });
      }
    }

    res.clearCookie("refresh_token");

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  login_user,
  refresh_access_token,
  logout_user
};
