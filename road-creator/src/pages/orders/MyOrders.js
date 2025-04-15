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
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const ordersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setOrders(ordersList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleExpand = (orderId) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    if (loading) {
        return <div className="text-center mt-10 text-white">Loading your orders...</div>;
    }


    return (
        <div className="orders-container">
            <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">🧾 My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-gray-400 text-center">You have no orders yet.</div>
            ) : (
                orders.map(order => (
                    <div
                        className="order-card"
                        onClick={() => toggleExpand(order.id)}
                    >
                        <div className="order-header">
                            <h2>Order ID: {order.id}</h2>
                            <span className="order-meta">
                                {new Date(order.timestamp.seconds * 1000).toLocaleString()}
                            </span>
                        </div>
                        <div className="order-details">
                            <p><strong>Total Objects:</strong> {order.objectsCount}</p>
                            <p><strong>Total Price:</strong> {order.price} credits</p>
                            <p><strong>Export Type:</strong> {order.exportType || "N/A"}</p>

                            <div className={`order-specs ${expandedOrderId === order.id ? '' : 'collapsed'}`}>
                                <strong>Objects:</strong>
                                <ul>
                                    {order.specs.map((obj, index) => (
                                        <li key={index}>
                                            {obj.name} — {obj.type || 'N/A'} — Color: #{obj.color || 'unknown'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyOrders;