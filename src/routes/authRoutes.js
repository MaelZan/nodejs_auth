import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Registration route
router.post('/register', [
    body('email').trim().isEmail().withMessage('Enter a Valid email adress'),
    body('password').trim().isLength({ min: 5 }).withMessage("Password must be longer than 5 charachters"),
    body('fname').trim().notEmpty().withMessage('First name required'),
    body('lname').trim().notEmpty().withMessage('Last name required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { password, fname, lname, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        // Check if email is already in use
        const emailUsed = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (emailUsed) {
            return res.status(409).json({ message: "There is already an account associated with that email" });
        }

        // Insert the new user
        const registerUser = db.prepare('INSERT INTO users (fname, lname, email, password) VALUES (?, ?, ?, ?)');
        const result = registerUser.run(fname, lname, email, hashedPassword);

        // Generate JWT token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "An error occurred when creating the user" });
    }
});

// Login route
router.post('/login', [
    body('email').trim().isEmail().withMessage('Must enter a valid email'),
    body('password').trim().notEmpty().withMessage('Must enter a password')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Log the email to check if it's properly passed
    console.log('Email:', email);

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Fetch user from DB using parameterized query
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Compare password with hashed password stored in DB
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Database error: ', err.message);
        res.status(503).send({message: 'Service unavailable'});
    }
});

router.post('/autologin',(req, res) => {
    const { token }  = req.body
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { return res.status(401).json({message: 'Invalid or expired token'})}
        else { return res.status(200).json({message: "successful authentication"})}
    } )
})

export default router;
