/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */

import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, setDoc, doc } from "firebase/firestore"; 
import "./Login.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");  
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the name to Firebase (using Firestore)
        const db = getFirestore();
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          uid: user.uid,
          balance: 0,  // Initialize balance
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Save user details to localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userUid", user.uid);
        localStorage.setItem("userBalance", 0);

        setIsSignUp(false)
        navigate("/dashboard");  // Redirect to dashboard after successful login/signup
    
      } else {
        // Sign in the user
        await signInWithEmailAndPassword(auth, email, password);
      }

      localStorage.setItem("isAuthenticated", "true");  // Mark as authenticated
      alert("Success!");
      navigate("/dashboard");  // Redirect to dashboard after successful login/signup
    } catch (error) {
      alert(error.message);
    }
  };

  // Check if the user is already authenticated and redirect if true
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated) {
      navigate("/dashboard"); // Redirect to dashboard if already logged in
    }
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="overlay" />
      <div className="login-box">
        <h1>Welcome to the 3D Map-to-Object Generator</h1>
        <p>Sign in to start transforming maps into immersive 3D experiences!</p>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
        </form>
        <button className="switch-btn" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Login" : "New here? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Login;
