import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, RotateCw, ArrowUpDown, ArrowLeftRight } from 'lucide-react';

const COLORS = ['white', 'red', 'blue', 'orange', 'green', 'yellow'];

const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

const CubePiece = ({ position, colors }) => (
    <div className="cube-piece" style={{
        transform: `translate3d(${position[0]}px, ${position[1]}px, ${position[2]}px)`
    }}>
        {colors.map((color, index) => (
            <div key={index} className={`face face-${index}`} style={{ backgroundColor: color }} />
        ))}
    </div>
);

const RubiksCube = () => {
    const [cubeState, setCubeState] = useState(() => {
        const initialState = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    initialState.push({
                        position: [x, y, z],
                        colors: [
                            y === -1 ? COLORS[0] : COLORS[5],
                            x === 1 ? COLORS[1] : COLORS[3],
                            z === -1 ? COLORS[2] : COLORS[4],
                            x === -1 ? COLORS[3] : COLORS[1],
                            z === 1 ? COLORS[4] : COLORS[2],
                            y === 1 ? COLORS[5] : COLORS[0],
                        ]
                    });
                }
            }
        }
        return initialState;
    });

    const [rotation, setRotation] = useState({ x: -30, y: 45, z: 0 });
    const [isRotating, setIsRotating] = useState(false);
    const cubeRef = useRef(null);

    const rotateFace = (face, direction) => {
        if (isRotating) return;
        setIsRotating(true);

        let axis, layer;
        switch (face) {
            case 'U': axis = 'y'; layer = -1; break;
            case 'D': axis = 'y'; layer = 1; break;
            case 'F': axis = 'z'; layer = -1; break;
            case 'B': axis = 'z'; layer = 1; break;
            case 'L': axis = 'x'; layer = -1; break;
            case 'R': axis = 'x'; layer = 1; break;
            case 'M': axis = 'x'; layer = 0; break;
            case 'E': axis = 'y'; layer = 0; break;
            case 'S': axis = 'z'; layer = 0; break;
        }

        const axisIndex = ['x', 'y', 'z'].indexOf(axis);

        setCubeState(prevState => {
            return prevState.map(piece => {
                if (piece.position[axisIndex] === layer) {
                    const newPosition = [...piece.position];
                    const newColors = [...piece.colors];

                    if (axis === 'x') {
                        if (direction === 'clockwise') {
                            [newPosition[1], newPosition[2]] = [newPosition[2], -newPosition[1]];
                            [newColors[0], newColors[2], newColors[5], newColors[4]] = [newColors[4], newColors[0], newColors[2], newColors[5]];
                        } else {
                            [newPosition[1], newPosition[2]] = [-newPosition[2], newPosition[1]];
                            [newColors[0], newColors[2], newColors[5], newColors[4]] = [newColors[2], newColors[5], newColors[4], newColors[0]];
                        }
                    } else if (axis === 'y') {
                        if (direction === 'clockwise') {
                            [newPosition[0], newPosition[2]] = [-newPosition[2], newPosition[0]];
                            [newColors[1], newColors[2], newColors[3], newColors[4]] = [newColors[4], newColors[1], newColors[2], newColors[3]];
                        } else {
                            [newPosition[0], newPosition[2]] = [newPosition[2], -newPosition[0]];
                            [newColors[1], newColors[2], newColors[3], newColors[4]] = [newColors[2], newColors[3], newColors[4], newColors[1]];
                        }
                    } else if (axis === 'z') {
                        if (direction === 'clockwise') {
                            [newPosition[0], newPosition[1]] = [newPosition[1], -newPosition[0]];
                            [newColors[0], newColors[1], newColors[5], newColors[3]] = [newColors[3], newColors[0], newColors[1], newColors[5]];
                        } else {
                            [newPosition[0], newPosition[1]] = [-newPosition[1], newPosition[0]];
                            [newColors[0], newColors[1], newColors[5], newColors[3]] = [newColors[1], newColors[5], newColors[3], newColors[0]];
                        }
                    }

                    return { ...piece, position: newPosition, colors: newColors };
                }
                return piece;
            });
        });

        setTimeout(() => setIsRotating(false), 500);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            const isShiftPressed = e.shiftKey;

            if (e.key === 'ArrowLeft') {
                setRotation(prev => ({ ...prev, y: prev.y - 10 }));
            } else if (e.key === 'ArrowRight') {
                setRotation(prev => ({ ...prev, y: prev.y + 10 }));
            } else if (e.key === 'ArrowUp') {
                setRotation(prev => ({ ...prev, x: prev.x - 10 }));
            } else if (e.key === 'ArrowDown') {
                setRotation(prev => ({ ...prev, x: prev.x + 10 }));
            }

            if (['U', 'D', 'F', 'B', 'L', 'R', 'M', 'E', 'S'].includes(key)) {
                rotateFace(key, isShiftPressed ? 'counterclockwise' : 'clockwise');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        let startX, startY, startRotation;

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startRotation = { ...rotation };
        };

        const handleTouchMove = (e) => {
            if (!startX || !startY) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            const rotationSpeed = 1.5;

            setRotation({
                x: startRotation.x - deltaY * rotationSpeed,
                y: startRotation.y + deltaX * rotationSpeed,
                z: rotation.z
            });
        };

        const handleTouchEnd = () => {
            startX = null;
            startY = null;
        };

        const cube = cubeRef.current;
        if (cube) {
            cube.addEventListener('touchstart', handleTouchStart);
            cube.addEventListener('touchmove', handleTouchMove);
            cube.addEventListener('touchend', handleTouchEnd);

            return () => {
                cube.removeEventListener('touchstart', handleTouchStart);
                cube.removeEventListener('touchmove', handleTouchMove);
                cube.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [rotation]);

    return (
        <div className="page-container min-h-screen h-full min-w-[100vw] w-full">
            <div className="rubiks-cube-container" ref={cubeRef}>
                <div className="rubiks-cube" style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
                }}>
                    {cubeState.map((piece, index) => (
                        <CubePiece key={index} position={piece.position.map(p => p * 66)} colors={piece.colors} />
                    ))}
                </div>
            </div>
            {isTouchScreen === true ? (
                <div className="controls">
                    <div className="control-row">
                        <button onClick={() => rotateFace('U', 'clockwise')}><ChevronUp /></button>
                        <button onClick={() => rotateFace('E', 'counterclockwise')}><ArrowUpDown /></button>
                        <button onClick={() => rotateFace('D', 'clockwise')}><ChevronDown /></button>
                    </div>
                    <div className="control-row">
                        <button onClick={() => rotateFace('L', 'clockwise')}><ChevronLeft /></button>
                        <button onClick={() => rotateFace('M', 'counterclockwise')}><ArrowLeftRight /></button>
                        <button onClick={() => rotateFace('R', 'clockwise')}><ChevronRight /></button>
                    </div>
                    <div className="control-row">
                        <button onClick={() => rotateFace('F', 'clockwise')}><RotateCw /></button>
                        <button onClick={() => rotateFace('S', 'clockwise')}><RotateCw /></button>
                        <button onClick={() => rotateFace('B', 'clockwise')}><RotateCcw /></button>
                    </div>
                </div>
            ) : (
                <div className="controls-info border border-black shadow-xl mt-2">
                    <p>Use the arrow keys to rotate the cube.</p>
                    <p>Use U, D, F, B, L, R, keys for faces and M, E, S keys for middle layers.</p>
                </div>
            )}
            <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #ffffff;
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .rubiks-cube-container {
          perspective: 1200px;
          width: 300px;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          touch-action: none;
        }
        .rubiks-cube {
          width: 198px;
          height: 198px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.2s;
        }
        .cube-piece {
          position: absolute;
          width: 60px;
          height: 60px;
          transition: transform 0.5s;
          transform-style: preserve-3d;
          left: 50%;
          top: 50%;
          margin-left: -30px;
          margin-top: -30px;
        }
        .face {
          position: absolute;
          width: 58px;
          height: 58px;
          border: 1px solid black;
          opacity: 0.9;
        }
        .face-0 { transform: rotateX(90deg) translateZ(30px); }
        .face-1 { transform: rotateY(90deg) translateZ(30px); }
        .face-2 { transform: translateZ(30px); }
        .face-3 { transform: rotateY(-90deg) translateZ(30px); }
        .face-4 { transform: rotateY(180deg) translateZ(30px); }
        .face-5 { transform: rotateX(-90deg) translateZ(30px); }
        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
        }
        .control-row {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        .control-row button {
          width: 50px;
          height: 50px;
          margin: 0 5px;
          background-color: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .control-row button:hover {
          background-color: #f0f0f0;
        }
        .controls-info {
          text-align: center;
          padding: 20px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .rubiks-cube-container {
            width: 240px;
            height: 240px;
          }
          .rubiks-cube {
            width: 158px;
            height: 158px;
          }
          .cube-piece {
            width: 48px;
            height: 48px;
            margin-left: -24px;
            margin-top: -24px;
          }
          .face {
            width: 46px;
            height: 46px;
          }
          .face-0 { transform: rotateX(90deg) translateZ(24px); }
          .face-1 { transform: rotateY(90deg) translateZ(24px); }
          .face-2 { transform: translateZ(24px); }
          .face-3 { transform: rotateY(-90deg) translateZ(24px); }
          .face-4 { transform: rotateY(180deg) translateZ(24px); }
          .face-5 { transform: rotateX(-90deg) translateZ(24px); }
          .control-row button {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
        </div>
    );
};

export default RubiksCube;