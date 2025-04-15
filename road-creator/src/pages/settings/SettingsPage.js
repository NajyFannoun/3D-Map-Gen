/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */

import React, { useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const plans = [
  { id: 'basic', label: 'Basic Plan', priceEUR: 5, credits: 30 },
  { id: 'pro', label: 'Pro Plan', priceEUR: 15, credits: 100 },
  { id: 'ultimate', label: 'Ultimate Plan', priceEUR: 20, credits: 170 }
];

const SettingsPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePaymentRequest = async () => {
    if (!user || !selectedPlan) return;

    const selected = plans.find((p) => p.id === selectedPlan);
    await addDoc(collection(db, 'balancerequest'), {
      userId: user.uid,
      email: user.email,
      plan: selected.label,
      amountEUR: selected.priceEUR,
      credits: selected.credits,
      status: 'pending',
      timestamp: new Date()
    });

    alert(`Payment request submitted for ${selected.label}. Admin will process it shortly.`);
    setSelectedPlan(null);
  };

  const handleNameUpdate = async () => {
    if (!user || !name) return;
    setIsUpdatingName(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name });
      localStorage.setItem('userName', name);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>💳 Balance & Plans</h2>
        <p>Visa card ending with <strong>3333</strong> is connected.</p>
        <div style={styles.planList}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                ...styles.planItem,
                ...(selectedPlan === plan.id ? styles.planItemSelected : {})
              }}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <h4>{plan.label}</h4>
              <p>{plan.credits} credits</p>
              <p><strong>{plan.priceEUR} €</strong></p>
            </div>
          ))}
        </div>
        <button
          style={{
            ...styles.button,
            ...(selectedPlan ? {} : styles.buttonDisabled)
          }}
          disabled={!selectedPlan}
          onClick={handlePaymentRequest}
        >
          Order & Pay
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>📝 Edit Profile</h2>
        <label style={styles.label}>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <button
          style={{
            ...styles.button,
            ...(isUpdatingName ? styles.buttonDisabled : {})
          }}
          onClick={handleNameUpdate}
          disabled={isUpdatingName}
        >
          {isUpdatingName ? 'Updating...' : 'Save Name'}
        </button>
        {nameSuccess && <p style={{ color: '#00ff99', marginTop: '8px' }}>✅ Name updated successfully</p>}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '30px',
    padding: '40px 20px',
    maxHeight: '100vh',
    backgroundSize: 'cover',
    position: 'relative',
    zIndex: 1
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    border: '1px solid #00ffff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  title: {
    color: '#00ffff',
    marginBottom: '10px'
  },
  planList: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  planItem: {
    flex: '1 1 120px',
    border: '2px solid #444',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease'
  },
  planItemSelected: {
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    fontWeight: 'bold'
  },
  button: {
    padding: '10px 15px',
    background: '#00ffff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonDisabled: {
    background: '#666',
    cursor: 'not-allowed'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ccc'
  },
  input: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#111',
    color: '#fff',
    width: '100%'
  }
};

export default SettingsPage;
