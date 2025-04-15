/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaCog, FaUserCircle } from 'react-icons/fa';
import { GiEarthAmerica } from 'react-icons/gi';
import { BiAlarm, BiBasket, BiMap } from 'react-icons/bi';
import './Dashboard.css';

import { db, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from "react-router-dom";

import RoadEditorPage from '../roadrunner/RoadEditor.js';
import SettingsPage from '../settings/SettingsPage.js';
import MyOrders from '../orders/MyOrders.js';

const Dashboard = () => {

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [objectPrice, setObjectPrice] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const configRef = doc(db, 'configs', 'global');
  
        // Real-time listener for user data
        const unsubscribeUser = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
            setBalance(data.balance || 0.00);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userBalance", data.balance || 0.00);
          }
        });
  
        // Real-time listener for config price
        const unsubscribeConfig = onSnapshot(configRef, (configSnap) => {
          if (configSnap.exists()) {
            const configData = configSnap.data();
            const objectPrice = configData?.objectPrice ?? 0;
            setObjectPrice(objectPrice);
            localStorage.setItem("objectPrice", objectPrice);
          }
        });
  
        // Clean up both listeners when user logs out or component unmounts
        return () => {
          unsubscribeUser();
          unsubscribeConfig();
        };
      }
    });
  
    return () => unsubscribeAuth(); // clean up auth listener
  }, []);
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Remove the authentication status from localStorage
      localStorage.removeItem("isAuthenticated");

      navigate("/login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'road-editor':
        return (
          <div className="map-section">
<h2>Road Editor {objectPrice !== null && `(Object Price: €${objectPrice})`} </h2>
<div className="map-container" style={{ width: '100%', height: '100%' }}>
              <RoadEditorPage />
            </div>
          </div>
        );
      case 'export':
        return <h2 style={{ padding: '20px' }}>functionality coming soon...</h2>;
      case 'settings':
        return (
          <div className="map-section">
            <h2>Settings</h2>
            <div className="map-container" style={{ width: '100%', height: '100%' }}>
              <SettingsPage />
            </div>
          </div>
        );
        case 'orders':
          return (
            <div className="map-section">
              <h2>MyOrders</h2>
              <div className="map-container" style={{ width: '100%', height: '100%' }}>
                <MyOrders />
              </div>
            </div>
          );
      default:
        return <div className="welcome-message"><h2>Welcome! Please select an option from the sidebar.</h2></div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="logo">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <img
      src={require('../../assets/icons/app_icon.png')}
      alt="3D Road App Logo"
      style={{ width: '60px', height: '60px' }}
    />
    <span style={{ fontSize: '60px', fontWeight: 'bold' }}>3D</span>
  </div>
</div>


        </div>        <ul className="nav-links">
          <li
            className={activeTab === 'road-editor' ? 'active' : ''}
            onClick={() => setActiveTab('road-editor')}
          >
            <GiEarthAmerica className="icon" /> Create/Edit Road
          </li>

          <li
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <BiBasket className="icon" /> My orders
          </li>
          <li
            className={activeTab === 'export' ? 'active' : ''}
            onClick={() => setActiveTab('export')}
          >
            <BiAlarm className="icon" /> Notifications
          </li>
          <li
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="icon" /> Settings
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span>{userData ? userData.name : 'Loading...'}</span>
          </div>
          <div className="user-balance">
            <span>Balance: €  {balance}</span>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
