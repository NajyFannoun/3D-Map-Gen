/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { OBJExporter } from "three-stdlib";

import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import { db } from "../../firebase/firebaseConfig"; 
import './RoadEditor.css';


const RoadEditor = () => {
    const mountRef = useRef(null);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [selectedScale, setSelectedScale] = useState(1);
    const [sceneObjects, setSceneObjects] = useState([]);
    const [selectedObjectType, setSelectedObjectType] = useState("road");
    const [exportType, setExportType] = useState("obj");
    const [balance, setBalance] = useState(0);
    const [message, setMessage] = useState("");
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [totalCost, setTotalCost] = useState(0); 

    useEffect(() => {
        const storedBalance = localStorage.getItem("userBalance");
        if (storedBalance) {
            setBalance(parseInt(storedBalance, 0));
        }
    }, []);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);

        if (mountRef.current) {
            // Remove any previous renderer instances
            while (mountRef.current.firstChild) {
                mountRef.current.removeChild(mountRef.current.firstChild);
            }
            mountRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const objectList = [];

        const gridHelper = new THREE.GridHelper(100, 100);
        scene.add(gridHelper);

        const road = new THREE.Mesh(new THREE.BoxGeometry(100, 0.5, 20), new THREE.MeshBasicMaterial({ color: 0x555555 }));
        road.name = "Road";
        scene.add(road);
        objectList.push(road);

        const sidewalkMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(100, 0.5, 7), sidewalkMaterial);
        leftSidewalk.position.set(0, 0.25, -10);
        leftSidewalk.name = "Sidewalk Left";
        scene.add(leftSidewalk);
        objectList.push(leftSidewalk);

        const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(100, 0.5, 7), sidewalkMaterial);
        rightSidewalk.position.set(0, 0.25, 10);
        rightSidewalk.name = "Sidewalk Right";
        scene.add(rightSidewalk);
        objectList.push(rightSidewalk);

        const dashedLineMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 2, gapSize: 2 });
        const points = [];
        for (let i = -50; i < 50; i += 4) {
            points.push(new THREE.Vector3(i, 0.25, 0));
        }
        const dashedLine = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), dashedLineMaterial);
        dashedLine.computeLineDistances();
        dashedLine.name = "Road Line";
        scene.add(dashedLine);
        objectList.push(dashedLine);

        const createTree = (x, y, index) => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3), new THREE.MeshBasicMaterial({ color: 0x8B4513 }));
            trunk.position.set(x, 1.5, y);
            trunk.name = `Tree ${index} Trunk`;
            scene.add(trunk);
            objectList.push(trunk);

            const foliage = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x228B22 }));
            foliage.position.set(x, 4, y);
            foliage.name = `Tree ${index} Foliage`;
            scene.add(foliage);
            objectList.push(foliage);
        };

        for (let i = -4; i <= 4; i++) {
            createTree(i * 7, 8, i + 5);
            createTree(i * 7, -8, i + 14);
        }

        const createBuilding = (x, y, height, index) => {
            const building = new THREE.Mesh(new THREE.BoxGeometry(3, height, 3), new THREE.MeshBasicMaterial({ color: 0x888888 }));
            building.position.set(x, height / 2, y);
            building.name = `Building ${index}`;
            scene.add(building);
            objectList.push(building);
        };

        for (let i = -4; i <= 4; i++) {
            const height = Math.random() * 10 + 5;
            createBuilding(i * 7, 12, height, i + 5);
            createBuilding(i * 7, -12, height, i + 14);
        }

        camera.position.set(0, 20, 50);
        camera.lookAt(0, 0, 0);

        setSceneObjects(objectList);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    const changeColor = (e) => {
        const color = e.target.value;
        setSelectedColor(color);
    
        sceneObjects.forEach((obj) => {
            if (obj.name.includes("Building")) {
                obj.material.color.set(color);
            }
        });
    };
    

    const changeSize = (e) => {
        const scale = parseFloat(e.target.value);
        setSelectedScale(scale);
        selectedObjects.forEach((obj) => obj.scale.set(scale, scale, scale));
    };

    const handleRadioChange = (e) => {
        const objectType = e.target.value;
        setSelectedObjectType(objectType);

        // Clear previously selected objects
        setSelectedObjects([]);

        // Select objects based on the object type
        if (objectType === "road") {
            // Select road and sidewalks only
            const road = sceneObjects.find((obj) => obj.name === "Road");
            const leftSidewalk = sceneObjects.find((obj) => obj.name === "Sidewalk Left");
            const rightSidewalk = sceneObjects.find((obj) => obj.name === "Sidewalk Right");
            setSelectedObjects([]);
            setSelectedObjects([road, leftSidewalk, rightSidewalk]);
        } else if (objectType === "everything") {
            // Select all objects explicitly by name
            const road = sceneObjects.find((obj) => obj.name === "Road");
            const leftSidewalk = sceneObjects.find((obj) => obj.name === "Sidewalk Left");
            const rightSidewalk = sceneObjects.find((obj) => obj.name === "Sidewalk Right");
            // const dashedLine = sceneObjects.find((obj) => obj.name === "Road Line");

            // Trees (you can loop through all tree trunks and foliage)
            const trees = sceneObjects.filter((obj) => obj.name.includes("Tree"));

            // Buildings (you can loop through all buildings)
            const buildings = sceneObjects.filter((obj) => obj.name.includes("Building"));
            setSelectedObjects([]);

            // Combine all selected objects
            setSelectedObjects([
                road,
                leftSidewalk,
                rightSidewalk,
                // dashedLine,
                ...trees,
                ...buildings,
            ]);
        }

        console.log('Updated selectedObjects:', selectedObjects.length);

    };

    const handleExportRadioChange = (e) => {
        setExportType(e.target.value);
    };

    const exportObjects = () => {
        const costPerObject = localStorage.getItem("objectPrice") || 3;
        ;
        const actualTotalCost = selectedObjects.length * costPerObject;
        setTotalCost(actualTotalCost);

        console.log(' selectedObjects:', selectedObjects.length);


        if (selectedObjects.length > 0) {
            // Check if balance is sufficient
            if (balance >= actualTotalCost) {
                setMessage(`
          You have selected ${selectedObjects.length} object(s).
          Each object costs ${costPerObject} credits.
          Total cost: ${actualTotalCost} credits.
        `);

                // Proceed to payment and export
                const paymentConfirmed = window.confirm(
                    `You are about to pay ${actualTotalCost} credits for exporting these objects.
          Do you want to continue?`
                );

                if (paymentConfirmed) {
                    setBalance(balance - actualTotalCost); // Deduct the balance after payment
                    setIsPaymentSuccessful(true);
                    logOrderToFirestore(actualTotalCost); // ✅ Log to Firestore
                    triggerExport(); // Call the export logic after payment
                } else {
                    setMessage("Payment was not confirmed. Export canceled.");
                }
            } else {
                setMessage(`
          You don't have enough balance to export these objects.
          You need ${actualTotalCost - balance} more credits.
          Please go to the balance page to add credits.
        `);
            }
        } else {
            alert("No objects selected for export.");
        }
    };

    const logOrderToFirestore = async (actualTotalCost) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            const order = {
                userId: user ? user.uid : "guest",
                objectsCount: selectedObjects.length,
                selectedObjectType,
                exportType,
                price: actualTotalCost,
                timestamp: Timestamp.now(),
                specs: selectedObjects.map(obj => ({
                    name: obj.name,
                    type: obj.type,
                    position: obj.position.toArray(),
                    scale: obj.scale.toArray(),
                    color: obj.material?.color?.getHexString?.() || null
                }))
            };

            await addDoc(collection(db, "orders"), order);
            console.log("Order logged to Firestore:", order);
        } catch (error) {
            console.error("Error logging order to Firestore:", error);
        }
    };


    const triggerExport = () => {
        const exporter = new OBJExporter();
        const group = new THREE.Group();
        selectedObjects.forEach((obj) => group.add(obj.clone()));

        const objData = exporter.parse(group);
        const blob = new Blob([objData], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `selected_objects.${exportType}`;
        link.click();
    };

    return (
        <div style={{ display: "flex" }}>
            <div style={{
                width: "300px",
                minWidth: "300px",
                maxWidth: "300px",
                height: "100vh",
                background: "#ffffff",
                borderRight: "1px solid #e3330e0",
                padding: "20px",
                boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
                fontFamily: "sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                backgroundColor: "rgba(9, 26, 62, 0.68)", 
            }}>
                <h2 style={{ marginTop: 5, color: "#00ffff", fontSize: "28px", fontWeight: "600" }}>🚧 Road Editor</h2>

                <section>
                    <h4 style={{ color: "#00ffff" }}>🎯 Object Selection</h4>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff" }}>
                            <input
                                type="radio"
                                name="objectType"
                                value="road"
                                checked={selectedObjectType === "road"}
                                onChange={handleRadioChange}
                                style={{
                                    backgroundColor: "#444",
                                    borderColor: "#555",
                                }}
                            />
                            <span>Road&Sidewalks</span>
                        </label>

                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff" }}>
                            <input
                                type="radio"
                                name="objectType"
                                value="everything"
                                checked={selectedObjectType === "everything"}
                                onChange={handleRadioChange}
                                style={{
                                    backgroundColor: "#444",
                                    borderColor: "#555",
                                }}
                            />
                            <span>Everything</span>
                        </label>
                    </div>
                </section>

                <section>
                    <h4 style={{ color: "#00ffff" }}>🎨 Customize</h4>
                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="colorPicker" style={{ color: "#fff", marginBottom: "8px", display: "block" }}>
                            Buildings Color
                        </label>
                        <input
                            id="colorPicker"
                            type="color"
                            value={selectedColor}
                            onChange={changeColor}
                            style={{
                                width: "100%",
                                height: "40px",
                                backgroundColor: "#444",
                                border: "1px solid #555",
                                borderRadius: "8px",
                                padding: "4px",
                                cursor: "pointer"
                            }}
                        />
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <label style={{ color: "#fff" }}>Scale</label><br />
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={selectedScale}
                            onChange={changeSize}
                            style={{
                                backgroundColor: "#444",
                                border: "1px solid #555",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />
                    </div>
                </section>

                <section>
                    <h4 style={{ color: "#00ffff" }}>📤 Export</h4>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff" }}>
                            <input
                                type="radio"
                                name="exportType"
                                value="obj"
                                checked={exportType === "obj"}
                                onChange={handleExportRadioChange}
                                style={{
                                    backgroundColor: "#444",
                                    borderColor: "#555",
                                }}
                            />
                            <span>.OBJ</span>
                        </label>

                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff" }}>
                            <input
                                type="radio"
                                name="exportType"
                                value="used"
                                checked={exportType === "used"}
                                onChange={handleExportRadioChange}
                                style={{
                                    backgroundColor: "#444",
                                    borderColor: "#555",
                                }}
                            />
                            <span>.USED</span>
                        </label>
                    </div>

                    <button
                        onClick={exportObjects}
                        style={{
                            marginTop: "10px",
                            padding: "12px 20px",
                            backgroundColor: "#00ffff",
                            color: "#333",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "500",
                            transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#00ccff"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#00ffff"}
                    >
                        Export Selected
                    </button>

                    {message && <p style={{ color: "#aaa", fontSize: "14px", marginTop: "10px" }}>{message}</p>}
                    {balance < totalCost && (
                        <button style={{ //onClick={() => window.location.href = "/balance"} 
                            marginTop: "5px",
                            backgroundColor: "#ff4d4f",
                            color: "#fff",
                            padding: "10px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}>
                            Add Credits
                        </button>
                    )}
                    {isPaymentSuccessful && (
                        <p style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>Export complete!</p>
                    )}
                </section>
            </div>

            <div ref={mountRef} style={{ flexGrow: 1, height: "100vh", width: "500px" }}></div>
        </div>
    );

};

export default RoadEditor;
